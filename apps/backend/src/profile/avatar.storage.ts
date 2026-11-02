import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import sharp from "sharp";
import type { Configuration } from "../config";
import { ApiError } from "../common/errors";
@Injectable()
export class AvatarStorage {
  constructor(@Inject("CONFIG") private readonly config: Configuration) {}
  async save(file: Express.Multer.File): Promise<string> {
    if (
      !file.buffer?.length ||
      file.size > this.config.AVATAR_MAX_SIZE_MB * 1024 * 1024
    )
      throw new ApiError(
        413,
        "FILE_TOO_LARGE",
        "The upload exceeds 2 MB.",
        "avatar",
      );
    const expected: Record<string, string> = {
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!expected[file.mimetype])
      throw new ApiError(
        400,
        "INVALID_FILE_TYPE",
        "Use a JPEG, PNG, or WebP image.",
        "avatar",
      );
    let bytes: Buffer, extension: string;
    try {
      const image = sharp(file.buffer, {
        limitInputPixels: 16_000_000,
        failOn: "warning",
        animated: false,
      });
      const metadata = await image.metadata();
      if (
        !metadata.width ||
        !metadata.height ||
        metadata.format !== expected[file.mimetype] ||
        (metadata.pages ?? 1) > 1
      )
        throw new Error("Invalid image metadata");
      extension = metadata.format === "jpeg" ? "jpg" : metadata.format;
      bytes = await image.rotate().toFormat(metadata.format).toBuffer();
      if (bytes.length > 2 * 1024 * 1024)
        throw new Error("Decoded output is too large");
    } catch {
      throw new ApiError(
        400,
        "INVALID_IMAGE",
        "The image bytes could not be validated.",
        "avatar",
      );
    }
    await mkdir(this.config.AVATAR_UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    await writeFile(resolve(this.config.AVATAR_UPLOAD_DIR, name), bytes, {
      flag: "wx",
      mode: 0o600,
    });
    return `avatars/${name}`;
  }
  async remove(path: string | null): Promise<void> {
    if (!path) return;
    const name = basename(path);
    if (!/^avatars\/[0-9a-f-]+\.(jpg|png|webp)$/.test(path))
      throw new Error("Invalid managed avatar path");
    await unlink(resolve(this.config.AVATAR_UPLOAD_DIR, name)).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      },
    );
  }
}
