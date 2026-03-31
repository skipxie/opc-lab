const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ===== 政策相关 API =====

export async function fetchPolicies(filters?: {
  q?: string;
  region?: string;
  types?: string[];
  audiences?: string[];
  days?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.q) params.set('q', filters.q);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.types?.length) params.set('types', filters.types.join(','));
  if (filters?.audiences?.length) params.set('audiences', filters.audiences.join(','));
  if (filters?.days) params.set('days', String(filters.days));

  return request<{ data: any[] }>(`/policies?${params.toString()}`);
}

export async function fetchFeaturedPolicies(limit?: number) {
  return request<{ data: any[] }>(`/policies/featured${limit ? `?limit=${limit}` : ''}`);
}

export async function fetchPolicy(id: string) {
  return request<{ data: any }>(`/policies/${id}`);
}

// ===== 政策管理 API =====

export async function fetchAdminPolicies(params?: { page?: number; limit?: number; q?: string }) {
  const search = new URLSearchParams(params as any).toString();
  return request<{ data: any[]; total: number }>(`/admin/policies?${search}`);
}

export async function createPolicy(data: any) {
  return request(`/admin/policies`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePolicy(id: string, data: any) {
  return request(`/admin/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePolicy(id: string) {
  return request(`/admin/policies/${id}`, {
    method: 'DELETE',
  });
}

// ===== 文章相关 API（公开）=====

export async function fetchArticles(page?: number, limit?: number) {
  return request<{ data: any[]; total: number }>(`/articles?page=${page || 1}&limit=${limit || 20}`);
}

export async function fetchArticleBySlug(slug: string) {
  return request<{ data: any }>(`/articles/${slug}`);
}

// ===== 文章管理 API =====

export async function fetchAdminArticles(params?: { page?: number; limit?: number; q?: string; status?: string }) {
  const search = new URLSearchParams(params as any).toString();
  return request<{ data: any[]; total: number }>(`/admin/articles?${search}`);
}

export async function fetchAdminArticle(id: number) {
  return request<{ data: any }>(`/admin/articles/${id}`);
}

export async function createArticle(data: any, authorId: number) {
  return request(`/admin/articles?authorId=${authorId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(id: number, data: any) {
  return request(`/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function publishArticle(id: number) {
  return request(`/admin/articles/${id}/publish`, {
    method: 'POST',
  });
}

export async function unpublishArticle(id: number) {
  return request(`/admin/articles/${id}/unpublish`, {
    method: 'POST',
  });
}

export async function deleteArticle(id: number) {
  return request(`/admin/articles/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchArticleCategories() {
  return request(`/admin/article-categories`);
}

export async function createArticleCategory(data: { name: string; slug: string; description?: string }) {
  return request(`/admin/article-categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticleCategory(id: number, data: any) {
  return request(`/admin/article-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArticleCategory(id: number) {
  return request(`/admin/article-categories/${id}`, {
    method: 'DELETE',
  });
}

// ===== RBAC 相关 API =====

export async function fetchRoles() {
  return request(`/admin/roles`);
}

export async function createRole(data: { name: string; code: string; description?: string }) {
  return request(`/admin/roles`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRole(id: number, data: any) {
  return request(`/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRole(id: number) {
  return request(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchPermissions() {
  return request(`/admin/permissions`);
}

export async function fetchRolePermissions(roleId: number) {
  return request(`/admin/roles/${roleId}/permissions`);
}

export async function assignPermissions(roleId: number, permissionIds: number[]) {
  return request(`/admin/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionIds }),
  });
}

export async function fetchMenus() {
  return request(`/admin/menus`);
}

export async function fetchUserMenus(userId: number) {
  return request(`/admin/user/menus?userId=${userId}`);
}

export async function createMenu(data: any) {
  return request(`/admin/menus`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenu(id: number, data: any) {
  return request(`/admin/menus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenu(id: number) {
  return request(`/admin/menus/${id}`, {
    method: 'DELETE',
  });
}

export async function assignUserRole(userId: number, roleId: number) {
  return request(`/admin/users/${userId}/roles/${roleId}`, {
    method: 'POST',
  });
}

export async function removeUserRole(userId: number, roleId: number) {
  return request(`/admin/users/${userId}/roles/${roleId}`, {
    method: 'DELETE',
  });
}

// ===== 用户相关 API =====

export async function fetchAdminUsers(params?: { page?: number; limit?: number; q?: string }) {
  const search = new URLSearchParams(params as any).toString();
  return request<{ data: User[]; total: number }>(`/admin/users?${search}`);
}

export interface User {
  id: number;
  email: string;
  username: string;
  nickname: string;
  role?: string;
  createdAt: string;
}

// ===== 政策爬虫 API =====

export async function fetchPolicyCrawlerStatus() {
  return request(`/admin/policy-crawler/status`);
}

export async function triggerPolicyCrawler(keyword?: string) {
  const url = keyword ? `/admin/policy-crawler/fetch?keyword=${encodeURIComponent(keyword)}` : '/admin/policy-crawler/fetch';
  return request(url, {
    method: 'POST',
  });
}

export async function getScheduleEnabled() {
  return request<{ enabled: boolean }>(`/admin/policy-crawler/schedule-enabled`);
}

export async function toggleSchedule(enabled: boolean) {
  return request(`/admin/policy-crawler/toggle-schedule`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}
