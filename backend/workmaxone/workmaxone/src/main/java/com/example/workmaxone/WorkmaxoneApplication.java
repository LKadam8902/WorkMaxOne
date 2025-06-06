package com.example.workmaxone;

import com.example.workmaxone.service.AdminService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class WorkmaxoneApplication {

	@Autowired
	private AdminService adminService;


	public static void main(String[] args) {
		SpringApplication.run(WorkmaxoneApplication.class, args);
	}

	@Value("${app.admin-email}")
	private String username;

	@Value("${app.admin-password}")
	private String password;

	@PostConstruct
	public void init() {
		try {

			adminService.checkAdmin(username,password);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("http://localhost:4200", "http://127.0.0.1:4200")
						.allowedMethods("GET", "PUT", "POST", "OPTIONS")
						.allowCredentials(true).maxAge(3600)
						.exposedHeaders("Token-Status");
			}
		};
	}

}
