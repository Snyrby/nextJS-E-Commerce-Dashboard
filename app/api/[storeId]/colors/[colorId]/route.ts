import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function GET(
  req: Request,
  { params }: { params: { colorId: string } }
) {
  try {
    if (!params.colorId) {
      return new NextResponse("A Color Id is required", { status: 400 });
    }
    const color = await prismadb.color.findUnique({
      where: { id: params.colorId },
    });
    return NextResponse.json(color, { status: 200 });
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
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
    if (!params.colorId) {
      return new NextResponse("A Color Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const color = await prismadb.color.updateMany({
      where: { id: params.colorId },
      data: { name, value },
    });
    return NextResponse.json(color, { status: 200 });
  } catch (error) {
    console.log("[Color_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!params.colorId) {
      return new NextResponse("A Color Id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized to perform that action", {
        status: 403,
      });
    }
    const color = await prismadb.color.deleteMany({
      where: { id: params.colorId },
    });
    return NextResponse.json(color, { status: 200 });
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
