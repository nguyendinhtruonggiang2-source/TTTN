package com.example.figure.auth;

public class RegisterRequest {
    private String username;
    private String name;
    private String email;
    private String password;
    private String address;
    private String phone;
    
    // Getters
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    
    // Setters
    public void setUsername(String username) { this.username = username; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setAddress(String address) { this.address = address; }
    public void setPhone(String phone) { this.phone = phone; }
}