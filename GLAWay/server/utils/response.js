const toPlainObject = (value) => {
  if (value?.toObject) {
    return value.toObject();
  }

  return value;
};

export const toClientPayload = (value, message) => {
  const payload = toPlainObject(value);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return {
      success: true,
      ...(message ? { message } : {}),
      data: payload ?? null
    };
  }

  return {
    success: true,
    ...(message ? { message } : {}),
    data: payload,
    ...payload
  };
};
