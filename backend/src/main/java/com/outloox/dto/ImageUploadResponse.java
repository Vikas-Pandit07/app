package com.outloox.dto;

public class ImageUploadResponse {
		
	private String url;
	private String publicId;
	private String formart;
	private int width;
	private int height;
	private long bytes;
	public ImageUploadResponse(String url, String publicId, String formart, int width, int height, long bytes) {
		super();
		this.url = url;
		this.publicId = publicId;
		this.formart = formart;
		this.width = width;
		this.height = height;
		this.bytes = bytes;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getPublicId() {
		return publicId;
	}
	public void setPublicId(String publicId) {
		this.publicId = publicId;
	}
	public String getFormart() {
		return formart;
	}
	public void setFormart(String formart) {
		this.formart = formart;
	}
	public int getWidth() {
		return width;
	}
	public void setWidth(int width) {
		this.width = width;
	}
	public int getHeight() {
		return height;
	}
	public void setHeight(int height) {
		this.height = height;
	}
	public long getBytes() {
		return bytes;
	}
	public void setBytes(long bytes) {
		this.bytes = bytes;
	}
}
