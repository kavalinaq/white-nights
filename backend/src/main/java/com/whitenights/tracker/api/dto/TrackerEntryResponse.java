package com.whitenights.tracker.api.dto;

import java.time.LocalDate;

public record TrackerEntryResponse(LocalDate date, Integer pagesRead) {}
