package com.outloox.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class BulkImageUploadRequest {
	
	private List<MultipartFile> images;
	private String folder;
	private boolean optimize;
	
	public List<MultipartFile> getImages() {
		return images;
	}
	public void setImages(List<MultipartFile> images) {
		this.images = images;
	}
	public String getFolder() {
		return folder;
	}
	public void setFolder(String folder) {
		this.folder = folder;
	}
	public boolean isOptimize() {
		return optimize;
	}
	public void setOptimize(boolean optimize) {
		this.optimize = optimize;
	}
}
