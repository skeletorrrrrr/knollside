"use client";
import { useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

// Drag-and-drop (or click-to-browse) image uploader. Uploads the file to the
// public "item-photos" Supabase Storage bucket and hands the resulting public
// URL back via onUploaded. Used for both material photos and business logos
// (logos go under a "logos/" path prefix in the same bucket).
export default function PhotoUpload({ itemId, pathPrefix, photoUrl, onUploaded, onRemoved, label }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = supabaseBrowser();
      const ext = file.name.split(".").pop() || "jpg";
      const folder = pathPrefix || itemId || "misc";
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("item-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  // A compact tile: shows the photo if present, otherwise a dashed drop zone.
  return (
    <div className="flex flex-col" style={{ minWidth: "9rem" }}>
      {photoUrl ? (
        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-line group">
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemoved}
            className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(33,31,27,0.75)", fontSize: "11px" }}
            title="Remove photo"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="w-full h-16 flex items-center justify-center text-center rounded-md border border-dashed cursor-pointer px-2 transition-colors"
          style={{
            borderColor: dragging ? "#B08A44" : "#DDD3BF",
            background: dragging ? "#F3ECDD" : "transparent",
            color: "#A39C8A",
            fontSize: "11px",
          }}
        >
          {uploading ? "Uploading…" : dragging ? "Drop image" : (label || "Drag photo or click to upload")}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <span className="text-[10px] text-clay mt-0.5">{error}</span>}
    </div>
  );
}
