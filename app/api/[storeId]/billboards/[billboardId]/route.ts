import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const { label, imageUrl } = await req.json();

    if (!label) {
      return new NextResponse("A label is required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("An Image Url is required", { status: 400 });
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
    const billboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: { label, imageUrl },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, billboardId:string } }
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
    const billboard = await prismadb.billboard.deleteMany({
      where: { id: params.billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
