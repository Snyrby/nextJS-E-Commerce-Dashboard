"use client";

import * as z from "zod";
import { Billboard } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [emptyValidation, setEmptyValidation] = useState("");

  const title = initialData ? "Edit billboard" : "Create Billboard";
  const description = initialData ? "Edit a billboard" : "Add a Billboard";
  const toastMessage = initialData ? "Billboard updated" : "Billboard created";
  const action = initialData
    ? loading
      ? "Saving"
      : "Save changes"
    : loading
    ? "Creating"
    : "Create";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { label: "", imageUrl: "" },
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("Store saved successfully.");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setSubmitButtonClicked(false);
      form.reset(data, { keepDirty: false, keepTouched: false });
    }
  };

  const handleChange = () => {
    setEmptyValidation(form.getValues("label"));
  };

  const handleBlur = (data: BillboardFormValues) => {
    if (!submitButtonClicked) {
      if (initialData) {
        form.setValue("label", initialData?.label);
      } else {
        form.reset(data, { keepDirty: false, keepTouched: false });
      }
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted successfully.");
    } catch (error) {
      toast.error(
        "Make sure you have removed all products and categories first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // const deleteImage = async () => {
  //   try {
  //     setLoading(true);
  //     await axios.delete(`/api/delete-image`, );
  // }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl
                  onChange={() => handleChange()}
                  onBlur={() => handleBlur}
                >
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={(public_Id) => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl
                    onChange={() => handleChange()}
                    onBlur={() => handleBlur}
                  >
                    <Input
                      disabled={loading}
                      placeholder="Billboard label"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            onMouseDown={() => setSubmitButtonClicked(true)}
            disabled={
              loading ||
              !form.getFieldState("label").isDirty ||
              emptyValidation === "" ||
              !form.getValues("imageUrl")
            }
            className="ml-auto mt-4"
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
