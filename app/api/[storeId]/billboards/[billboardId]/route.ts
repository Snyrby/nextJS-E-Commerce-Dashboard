import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("A Billboard Id is required", { status: 400 });
    }
    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });
    return NextResponse.json(billboard, { status: 200 });
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const { label, imageUrl, imageId } = await req.json();

    if (!label) {
      return new NextResponse("A label is required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("An Image Url is required", { status: 400 });
    }
    if (!imageId) {
      return new NextResponse("An Image Id is required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("A billboard Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const oldBillboard = await prismadb.billboard.findFirst({ 
      where: { id: params.billboardId },
    })
    const oldImageId: any = oldBillboard?.imageId
    if (imageId !== oldImageId) {
      await cloudinary.api.delete_resources(oldImageId, {
        type: "upload",
        resource_type: "image",
      });
    }
    const billboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: { label, imageUrl, imageId },
    });
    return NextResponse.json(billboard, { status: 200 });
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!params.billboardId) {
      return new NextResponse("A Billboard Id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const billboard = await prismadb.billboard.findFirst({
      where: { id: params.billboardId },
    });
    const imageId: any = billboard?.imageId
    await cloudinary.api.delete_resources(imageId, {
      type: "upload",
      resource_type: "image",
    });
    const billboardDelete = await prismadb.billboard.deleteMany({
      where: { id: params.billboardId },
    })
    return NextResponse.json(billboardDelete, { status: 200 });
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
