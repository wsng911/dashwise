interface 添加搜索EngineOptions {
  token: string;
}

/**
 * 添加s a new search engine to the user configuration.
 */
export async function add搜索Engine(
  newItem: 搜索Engine,
  { token }: 添加搜索EngineOptions
) {
  const { post } = await import("@/lib/apiClient");
  const json = await post(`/config?path=searchEngines`, { newItem }, { token });
  if (json?.error) throw new Error(json.error || "Request failed");
  return json;
}