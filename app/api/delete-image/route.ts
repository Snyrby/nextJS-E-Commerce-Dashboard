import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs";
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  const { imageId } = await req.json();
  
  if (!imageId) {
    return NextResponse.json(
      { message: "Image Id is required." },
      { status: 400 }
    );
  }
  try {
    const result = await cloudinary.api.delete_resources(imageId, {
      type: "upload",
      resource_type: "image",
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
