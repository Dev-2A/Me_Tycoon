package com.metycoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardCreateRequest {
    @NotBlank(message = "보상 이름은 필수 항목입니다")
    private String name;

    @NotBlank(message = "보상 설명은 필수 항목입니다")
    private String description;

    @NotNull(message = "보상 비용은 필수 항목입니다")
    @Positive(message = "보상 비용은 양수여야 합니다")
    private Integer cost;
}