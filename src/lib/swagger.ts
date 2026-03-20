import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GlobalSafe Warranty Management API',
      version: '1.0.0',
      description: 'API quản lý bảo hành GlobalSafe',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        WarrantyClaim: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            claimCode: { type: 'string', example: 'GSC-250320-00001' },
            status: {
              type: 'string',
              enum: ['reception', 'overdue', 'pending_approval', 'processing', 'completed'],
            },
            claimType: {
              type: 'string',
              enum: ['repair', 'replacement', 'extended_warranty'],
            },
            customer: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
                address: { type: 'string' },
              },
            },
            device: {
              type: 'object',
              properties: {
                imei: { type: 'string' },
                brand: { type: 'string' },
                model: { type: 'string' },
                type: { type: 'string' },
                purchaseDate: { type: 'string', format: 'date' },
                purchasePrice: { type: 'number' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SparePart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            unit: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'manager', 'staff'] },
            center: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Claims', description: 'Quản lý hồ sơ bảo hành' },
      { name: 'Parts', description: 'Quản lý linh kiện' },
      { name: 'Users', description: 'Quản lý người dùng' },
      { name: 'Dashboard', description: 'Thống kê tổng quan' },
    ],
    paths: {
      '/claims': {
        get: {
          tags: ['Claims'],
          summary: 'Danh sách hồ sơ bảo hành',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Tìm theo IMEI, mã hồ sơ, tên KH' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: 'Thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      claims: { type: 'array', items: { $ref: '#/components/schemas/WarrantyClaim' } },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Claims'],
          summary: 'Tạo hồ sơ bảo hành mới',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer', 'device', 'claimType'],
                  properties: {
                    customer: { $ref: '#/components/schemas/WarrantyClaim/properties/customer' },
                    device: { $ref: '#/components/schemas/WarrantyClaim/properties/device' },
                    claimType: { type: 'string', enum: ['repair', 'replacement', 'extended_warranty'] },
                    description: { type: 'string' },
                    receivedFrom: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Tạo thành công' },
            400: { description: 'Dữ liệu không hợp lệ' },
          },
        },
      },
      '/claims/{id}': {
        get: {
          tags: ['Claims'],
          summary: 'Chi tiết hồ sơ bảo hành',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Thành công', content: { 'application/json': { schema: { $ref: '#/components/schemas/WarrantyClaim' } } } },
            404: { description: 'Không tìm thấy' },
          },
        },
        put: {
          tags: ['Claims'],
          summary: 'Cập nhật hồ sơ',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WarrantyClaim' } } } },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
      },
      '/claims/{id}/diagnosis': {
        put: {
          tags: ['Claims'],
          summary: 'Cập nhật chẩn đoán',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mainSymptom: { type: 'string' },
                    remediation: { type: 'string' },
                    processingPlan: { type: 'string' },
                    conclusion: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
      },
      '/claims/{id}/quote': {
        put: {
          tags: ['Claims'],
          summary: 'Gửi báo giá',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parts: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          partId: { type: 'string' },
                          quantity: { type: 'integer' },
                          unitPrice: { type: 'number' },
                        },
                      },
                    },
                    totalAmount: { type: 'number' },
                    repairDays: { type: 'integer' },
                    technicianName: { type: 'string' },
                    technicianPhone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Gửi báo giá thành công' } },
        },
      },
      '/claims/{id}/repair': {
        put: {
          tags: ['Claims'],
          summary: 'Cập nhật thông tin sửa chữa',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    doNumber: { type: 'string', description: 'Mã DO#' },
                    doDate: { type: 'string', format: 'date' },
                    afterRepairImages: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
      },
      '/claims/{id}/complete': {
        put: {
          tags: ['Claims'],
          summary: 'Hoàn thiện hồ sơ',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    completionStatus: { type: 'string', enum: ['insurance_complete', 'service_complete', 'insurance_service_complete'] },
                    deliveryType: { type: 'string', enum: ['direct', 'shipping'] },
                    processingMethod: { type: 'string', enum: ['repair', 'replacement'] },
                    shippingInfo: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Hoàn thiện thành công' } },
        },
      },
      '/claims/{id}/status': {
        patch: {
          tags: ['Claims'],
          summary: 'Cập nhật trạng thái hồ sơ',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['reception', 'overdue', 'pending_approval', 'processing', 'completed'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
      },
      '/parts': {
        get: {
          tags: ['Parts'],
          summary: 'Danh sách linh kiện',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Thành công' } },
        },
        post: {
          tags: ['Parts'],
          summary: 'Thêm linh kiện mới',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['code', 'name', 'category', 'price'],
                  properties: {
                    code: { type: 'string' },
                    name: { type: 'string' },
                    category: { type: 'string', enum: ['ĐIỆN THOẠI', 'LAPTOP', 'SMARTWATCH', 'TABLET'] },
                    price: { type: 'number' },
                    unit: { type: 'string', default: 'cái' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Tạo thành công' } },
        },
      },
      '/parts/{id}': {
        put: {
          tags: ['Parts'],
          summary: 'Cập nhật linh kiện',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SparePart' } } } },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
        delete: {
          tags: ['Parts'],
          summary: 'Xóa linh kiện',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Xóa thành công' } },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Danh sách người dùng (Admin)',
          responses: { 200: { description: 'Thành công' } },
        },
        post: {
          tags: ['Users'],
          summary: 'Tạo người dùng mới (Admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'manager', 'staff'] },
                    center: { type: 'string' },
                    phone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Tạo thành công' } },
        },
      },
      '/users/{id}': {
        put: {
          tags: ['Users'],
          summary: 'Cập nhật người dùng',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Xóa người dùng',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Xóa thành công' } },
        },
      },
      '/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Thống kê tổng quan',
          responses: {
            200: {
              description: 'Thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      reception: { type: 'integer' },
                      overdue: { type: 'integer' },
                      pending_approval: { type: 'integer' },
                      processing: { type: 'integer' },
                      completed: { type: 'integer' },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/upload': {
        post: {
          tags: ['Claims'],
          summary: 'Upload hình ảnh',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Upload thành công',
              content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string' } } } } },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
