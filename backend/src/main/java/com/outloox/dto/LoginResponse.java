package com.outloox.dto;

public class LoginResponse {

    private String username;
    private String email;
    private String token;

    public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public LoginResponse(String username, String email, String token) {
        this.username = username;
        this.email = email;
        this.token = token;
        }


	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
    
}
