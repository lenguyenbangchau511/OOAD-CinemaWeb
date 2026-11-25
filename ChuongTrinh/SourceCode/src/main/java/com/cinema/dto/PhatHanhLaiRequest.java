package com.cinema.dto;

import java.util.List;

/** Thử phát hành lại vé cho đơn đã thu tiền nhưng chưa phát hành được vé. */
public record PhatHanhLaiRequest(String maPhienGiu, List<String> dsMaGheSuat) {
}
