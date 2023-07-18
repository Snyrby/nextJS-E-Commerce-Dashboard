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
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("A Size Id is required", { status: 400 });
    }
    const size = await prismadb.size.findUnique({
      where: { id: params.sizeId },
    });
    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log("[SIZE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const { name, value } = await req.json();

    if (!name) {
      return new NextResponse("A name is required", { status: 400 });
    }
    if (!value) {
      return new NextResponse("A value is required", { status: 400 });
    }
    if (!params.sizeId) {
      return new NextResponse("A Size Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const size = await prismadb.size.updateMany({
      where: { id: params.sizeId },
      data: { name, value },
    });
    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!params.sizeId) {
      return new NextResponse("A Size Id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const size = await prismadb.size.deleteMany({
      where: { id: params.sizeId },
    });
    return NextResponse.json(size, { status: 200 });
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
