package com.mabu.system.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mabu Dojo System API")
                        .description("Hệ thống quản lý nâng đai thi đấu cho Võ đường Mabu Dojo")
                        .version("1.0.0"));
    }
}
