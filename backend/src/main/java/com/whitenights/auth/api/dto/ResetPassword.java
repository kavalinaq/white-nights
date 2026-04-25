package com.whitenights.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPassword(
    @NotBlank String token,
    @NotBlank @Size(min = 8) String newPassword
) {}
