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
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("A Category Id is required", { status: 400 });
    }
    const category = await prismadb.category.findUnique({
      where: { id: params.categoryId },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const { name, billboardId } = await req.json();

    if (!name) {
      return new NextResponse("A Name is required", { status: 400 });
    }
    if (!billboardId) {
      return new NextResponse("A Billboard Id is required", { status: 400 });
    }
    if (!params.categoryId) {
      return new NextResponse("A Category Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const category = await prismadb.category.updateMany({
      where: { id: params.categoryId },
      data: { name, billboardId },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!params.categoryId) {
      return new NextResponse("A Category Id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const category = await prismadb.category.deleteMany({
      where: { id: params.categoryId },
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
