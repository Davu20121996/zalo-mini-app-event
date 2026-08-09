# API V1 — Event Mini App (Zalo)

Tài liệu mô tả các endpoint API v1 dành cho Zalo Mini App. Backend là Laravel, route được khai báo trong `routes/api.php`.

## Thông tin chung

- **Base URL:** `https://<domain>/api`
- **Định dạng:** `application/json`
- **Ký tự:** UTF-8
- **Không yêu cầu xác thực (public)** cho nhóm endpoint `v1/zalo`.

### Envelope response

Mọi response đều trả về JSON theo cấu trúc:

| Field     | Type                | Mô tả                                         |
| --------- | ------------------- | --------------------------------------------- |
| `status`  | `string`            | `success` \| `error` \| `not_found`           |
| `message` | `string \| null`    | Thông điệp (chỉ có khi lỗi / thông báo)       |
| `data`    | `object \| array \| null` | Dữ liệu trả về (tùy endpoint)            |
| `errors`  | `object \| null`    | Chi tiết lỗi validation (chỉ ở `POST register`) |

### Mã HTTP

| Mã  | Ý nghĩa                                    |
| --- | ------------------------------------------ |
| 200 | Thành công (`status = "success"`)          |
| 201 | Tạo mới thành công (`register`)            |
| 422 | Lỗi validation (`status = "error"`)        |
| 404 | Không tìm thấy dữ liệu (`status = "not_found"` hoặc `"error"`) |

---

## 1. GET /api/v1/zalo/customer

Lấy thông tin khách hàng (attendee) theo số điện thoại.

### Query params

| Param   | Bắt buộc | Type     | Ghi chú                          |
| ------- | -------- | -------- | -------------------------------- |
| `phone` | Có       | `string` | Tối đa 20 ký tự. Hỗ trợ tìm theo format `09xxxxxxxx`, `849xxxxxxxx`, có/không có dấu cách, `+`, `-`, `(`, `)`. |

### Response 200

```json
{
  "status": "success",
  "data": {
    "attendee_id": 1,
    "name": "Nguyễn Văn A",
    "email": "a@gmail.com",
    "phone": "0901234567",
    "company": "ABC Corp",
    "tax_code": "0123456789",
    "company_size": "50-200",
    "company_size_label": "50 - 200 nhân viên",
    "interested_products": "ERP, CRM",
    "ticket_type": "VIP",
    "status": "confirmed",
    "status_label": "Đã xác nhận",
    "qr": "ATT-2026-ABCD1234",
    "checked_in": true,
    "checked_in_at": "2026-08-01 08:30:00",
    "registered_at": "2026-07-20 10:00:00",
    "event": {
      "id": 1,
      "name": "SMB Summit 2026",
      "slug": "smb-summit-2026",
      "start_date": "2026-08-01 08:00:00",
      "end_date": "2026-08-01 17:00:00",
      "venue": "Gem Center, 8 Nguyễn Bỉnh Khiêm, Q1"
    },
    "voucher": {
      "id": 5,
      "code": "VCR-ABC123",
      "name": "Vé VIP ưu đãi",
      "type": "discount_percent",
      "value": 20,
      "discount_label": "Giảm 20%",
      "discount_amount": 500000,
      "description": "Giảm 20% giá vé VIP",
      "valid_until": "2026-12-31 23:59:59"
    }
  }
}
```

### Field details

- `status` (attendee): `pending` | `confirmed` | `attended` | `cancelled`
- `status_label`: `Chờ duyệt` | `Đã xác nhận` | `Đã tham gia` | `Đã hủy`
- `company_size`: `lt30` | `30-50` | `50-200` | `gt200` | `organization`
- `checked_in`: `true` khi attendee đã check-in (có `checked_in_at`)
- `event`, `voucher`: là `null` nếu không có dữ liệu.
- `voucher.discount_amount`: lấy từ attendee (giá trị giảm thực tế), `null` nếu không áp dụng.
- Thời gian trả theo format `Y-m-d H:i:s`.

### Response 404

```json
{
  "status": "not_found",
  "message": "Không có số điện thoại liên kết với khách hàng."
}
```

### Response 422 (thiếu phone)

```json
{
  "status": "error",
  "message": "The phone field is required."
}
```

---

## 2. GET /api/v1/zalo/qr-checkin

Lấy mã QR check-in của khách theo số điện thoại. Nếu khách chưa có mã QR sẽ tự sinh mã mới.

### Query params

| Param   | Bắt buộc | Type     | Ghi chú               |
| ------- | -------- | -------- | --------------------- |
| `phone` | Có       | `string` | Tối đa 20 ký tự.      |

### Response 200

```json
{
  "status": "success",
  "data": {
    "attendee_id": 1,
    "name": "Nguyễn Văn A",
    "event_name": "SMB Summit 2026",
    "qr_code": "ATT-2026-ABCD1234",
    "qr_code_url": "https://domain/event/ticket-qr/1",
    "qr_png_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAA..." ,
    "checked_in": false,
    "checked_in_at": null
  }
}
```

### Field details

- `qr_code_url`: link trang xem vé trên web.
- `qr_png_base64`: ảnh QR PNG dạng data-uri base64 (kích thước 240px), dùng để render trực tiếp trong mini app. Là `null` nếu server không sinh được ảnh (thiếu thư viện GD).

### Response 404 / 422

Giống endpoint `customer`.

---

## 3. GET /api/v1/zalo/vouchers

Lấy voucher đang sử dụng (`current_voucher`) và danh sách voucher đang active của sự kiện theo số điện thoại.

### Query params

| Param   | Bắt buộc | Type     | Ghi chú          |
| ------- | -------- | -------- | ---------------- |
| `phone` | Có       | `string` | Tối đa 20 ký tự. |

### Response 200

```json
{
  "status": "success",
  "data": {
    "current_voucher": {
      "id": 5,
      "code": "VCR-ABC123",
      "name": "Vé VIP ưu đãi",
      "type": "discount_percent",
      "type_label": "Giảm % giá vé",
      "value": 20,
      "discount_label": "Giảm 20%",
      "description": "Giảm 20% giá vé VIP",
      "valid_from": "2026-01-01 00:00:00",
      "valid_until": "2026-12-31 23:59:59",
      "remaining_uses": null,
      "is_available": true
    },
    "active_vouchers": [
      {
        "id": 6,
        "code": "VCR-DEF456",
        "name": "Vé miễn phí",
        "type": "free_ticket",
        "type_label": "Vé miễn phí (100%)",
        "value": 100,
        "discount_label": "Vé miễn phí 100%",
        "description": "",
        "valid_from": null,
        "valid_until": "2026-08-15 23:59:59",
        "remaining_uses": 50,
        "is_available": true
      }
    ]
  }
}
```

### Field details

- `current_voucher`: voucher gán cho khách, `null` nếu chưa có.
- `active_vouchers`: voucher `status = active`, thuộc event của khách **hoặc** áp dụng cho mọi event (`event_id = null`), đã lọc chỉ còn những voucher còn khả dụng (`is_available = true`).
- `type`: `discount_percent` | `discount_fixed` | `free_ticket` | `gift` | `priority_seat`
- `type_label`: nhãn tiếng Việt của type.
- `remaining_uses`: số lượt dùng còn lại, `null` nếu không giới hạn (`max_uses = null`).
- `is_available`: `true` khi voucher còn hiệu lực (active, trong thời gian valid, chưa hết lượt).

### Response 404 / 422

Giống endpoint `customer`.

---

## 4. GET /api/v1/zalo/events

Lấy danh sách sự kiện đang active (`is_active = 1`), sắp theo `start_date` tăng dần. Nếu truyền `phone` sẽ trả kèm trạng thái đăng ký của khách.

### Query params

| Param   | Bắt buộc | Type     | Ghi chú                                     |
| ------- | -------- | -------- | ------------------------------------------- |
| `phone` | Không    | `string` | Tối đa 20 ký tự. Để trống → `is_registered = false` cho tất cả. |

### Response 200

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "SMB Summit 2026",
      "slug": "smb-summit-2026",
      "description": "Hội thảo công nghệ",
      "start_date": "2026-08-01 08:00:00",
      "end_date": "2026-08-01 17:00:00",
      "registration_deadline": "2026-07-30 23:59:59",
      "venue": "Gem Center, 8 Nguyễn Bỉnh Khiêm, Q1",
      "zalo_url": "https://zalo.me/1234567890",
      "fanpage_url": "https://facebook.com/smb",
      "is_registered": true,
      "event_url": "https://domain/event/smb-summit-2026"
    }
  ]
}
```

### Field details

- `registration_deadline`: `null` nếu không cấu hình.
- `venue`: tên + địa chỉ địa điểm đầu tiên của event, hoặc `about_where` nếu không có venue. Có thể là `null`.
- `zalo_url`, `fanpage_url`: có thể là `null`.
- `is_registered`: `true` nếu phone khớp một attendee đã đăng ký đúng event này.
- `event_url`: `null` nếu event không có slug.

### Response 422 (phone sai định dạng)

```json
{
  "status": "error",
  "message": "The phone must not be greater than 20 characters."
}
```

---

## 5. POST /api/v1/zalo/register

Tạo đăng ký mới hoặc cập nhật (restore + cập nhật thông tin) nếu khách đã tồn tại theo `phone` + `event_id`.

### Body params (application/json)

| Param                  | Bắt buộc | Type      | Ghi chú                                    |
| ---------------------- | -------- | --------- | ------------------------------------------ |
| `phone`                | Có       | `string`  | Regex `^[0-9+\-\s()]+$`, max 20.           |
| `name`                 | Có       | `string`  | Min 2, max 255.                            |
| `email`                | Không    | `string`  | Email hợp lệ, max 255.                     |
| `company`              | Không    | `string`  | Max 255.                                   |
| `tax_code`             | Không    | `string`  | Max 30.                                    |
| `company_size`         | Không    | `string`  | Max 50.                                    |
| `interested_products`  | Không    | `string`  | Max 255.                                   |
| `ticket_type`          | Không    | `string`  | Max 255.                                   |
| `event_id`             | Không    | `integer` | Phải tồn tại trong bảng `events`. Nếu bỏ trống → dùng event active đầu tiên. |

### Response 201 (thành công)

```json
{
  "status": "success",
  "message": "Đăng ký sự kiện thành công.",
  "data": {
    "attendee_id": 1,
    "name": "Nguyễn Văn A",
    "email": "a@gmail.com",
    "phone": "0901234567",
    "event": {
      "id": 1,
      "name": "SMB Summit 2026",
      "slug": "smb-summit-2026",
      "start_date": "2026-08-01 08:00:00",
      "end_date": "2026-08-01 17:00:00",
      "venue": "Gem Center, 8 Nguyễn Bỉnh Khiêm, Q1"
    },
    "status": "pending",
    "qr_code": "ATT-2026-ABCD1234",
    "qr_code_url": "https://domain/event/ticket-qr/1"
  }
}
```

### Response 422 (validation lỗi)

```json
{
  "status": "error",
  "message": "The phone field is required.",
  "errors": {
    "phone": ["The phone field is required."],
    "name": ["The name must be at least 2 characters."]
  }
}
```

### Response 404 (không có sự kiện active)

```json
{
  "status": "error",
  "message": "Chưa có sự kiện nào đang hoạt động."
}
```

### Ghi chú

- Khách đã tồn tại (`phone` + `event_id`, kể cả bị xóa mềm) → `restore()` và cập nhật thông tin mới, giữ nguyên `status` cũ nếu đã có.
- Khách mới luôn tạo với `status = "pending"`.
- Mã `qr_code` được tự sinh nếu trống.

---

## 6. GET /api/v1/zalo/event/{id}

Trả về **toàn bộ dữ liệu** của một sự kiện (tương đương trang event trên web) để mini app dựng lại trang chi tiết. `{id}` có thể là id hoặc `slug` của sự kiện.

### Path params

| Param | Type      | Ghi chú              |
| ----- | --------- | -------------------- |
| `id`  | `integer \| string` | ID hoặc slug của event. |

### Response 200

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "The Annual Marketing Conference",
    "slug": "annual-marketing-conference",
    "description": null,
    "start_date": "2026-12-10",
    "end_date": "2026-12-12",
    "registration_deadline": null,
    "is_active": true,
    "countdown_enabled": true,
    "calendar_enabled": false,
    "show_gallery": true,
    "show_sponsors": true,
    "show_tickets": true,
    "meta_title": "Sự kiện SMB+ — The Annual Marketing Conference",
    "meta_description": "Tham gia sự kiện SMB+...",
    "favicon_url": null,
    "og_image": null,
    "zalo_url": "https://zalo.me/123",
    "fanpage_url": "https://facebook.com/smb",
    "about_description": "Mô tả chi tiết sự kiện",
    "about_where": "Downtown Conference Center, New York",
    "about_when": "Monday to Wednesday<br>December 10-12",
    "venue": "Downtown Conference Center, New York, 157 William St",
    "pc_bg_image_url": "/storage/89/....jpg",
    "mobile_bg_image_url": "/storage/88/....jpg",
    "hero_image": "/storage/89/....jpg",
    "mobile_hero_image": "/storage/88/....jpg",
    "event_url": "https://domain/event/annual-marketing-conference",

    "settings": {
      "title": "The Annual<br><span>Marketing</span> Conference",
      "subtitle": "10-12 December, Downtown Conference Center, New York",
      "about_description": "...",
      "about_where": "...",
      "about_when": "...",
      "contact_email": "info@smbplus.vn",
      "contact_phone": "028 7301 3388",
      "...": "Các key-value settings toàn cục + riêng event (đã merge)"
    },

    "key_benefits": [
      { "icon": "fa-bullseye", "title": "Latest trend updates", "description": "...", "sort_order": 1 }
    ],

    "speakers": [
      {
        "id": 1, "name": "Sarah Mitchell", "role": "CEO", "company": "SMB+",
        "twitter": "#", "facebook": "#", "linkedin": "#",
        "description": "CMO, BrightLane",
        "full_description": "Sarah has led global brand...",
        "photo_url": "https://domain/storage/1/1.jpg",
        "photo_thumb": "https://domain/storage/1/conversions/1-thumb.jpg"
      }
    ],

    "schedules": [
      {
        "id": 32, "title": "Registration & Welcome Coffee",
        "subtitle": "Pick up your badge...", "day_number": 1,
        "start_time": "09:00:00", "desc": null,
        "speaker": { "id": 1, "name": "Sarah Mitchell", "role": "CEO", "photo_url": "...", "photo_thumb": "..." }
      }
    ],

    "venues": [
      {
        "id": 1, "name": "Downtown Conference Center", "address": "157 William St",
        "latitude": "40.7101282", "longitude": "-74.0062269",
        "description": "...",
        "photos": [ { "url": "...", "thumbnail": "..." } ]
      }
    ],

    "hotels": [
      { "id": 1, "name": "The Manhattan Grand", "rating": 5, "address": null, "description": "0.3 Mile from the Venue", "photo_url": "...", "photo_thumb": "..." }
    ],

    "galleries": [
      { "id": 1, "name": "The Annual Marketing Conference", "photos": [ { "url": "...", "thumbnail": "..." } ] }
    ],

    "sponsors": [
      { "id": 1, "name": "HubSpot", "link": "#", "logo_url": "...", "logo_thumb": "..." }
    ],

    "faqs": [
      { "id": 13, "question": "What topics will be covered?", "answer": "The agenda spans..." }
    ],

    "amenities": [ { "id": 1, "name": "General Admission" } ],

    "prices": [
      { "id": 1, "name": "General Pass", "price": "149.00", "amenity_ids": [1, 2, 3] }
    ]
  }
}
```

### Field details

- `hero_image` / `mobile_hero_image`: ảnh nền tối ưu (ưu tiên PC bg, fallback mobile bg); có thể là `null`.
- `venue`: chuỗi "tên, địa chỉ" lấy từ venue đầu tiên hoặc `about_where`.
- Các văn bản (`name`, `description`, `settings`, ...) được trả dạng đã giải mã đa ngôn ngữ (nếu DB lưu JSON `{"vi":...,"en":...}` sẽ trả theo locale hiện tại, fallback `vi` → `en`). Chuỗi thường được giữ nguyên.
- `schedules`: danh sách phẳng (chưa nhóm). Muốn nhóm theo ngày dùng `day_number` như web.
- `prices[].amenity_ids`: danh sách id tiện ích (`amenities`) đi kèm gói tham dự.
- `speaker`, `schedule.speaker`, `sponsor.link` có thể là `null`.

### Response 404

```json
{
  "status": "not_found",
  "message": "Không tìm thấy sự kiện."
}
```

---

## Bảng liệt kê endpoint nhanh

| Method | Endpoint                          | Mô tả                                    | Auth |
| ------ | --------------------------------- | ---------------------------------------- | ---- |
| GET    | `/api/v1/zalo/customer`           | Thông tin khách theo phone               | Không |
| GET    | `/api/v1/zalo/qr-checkin`         | Mã QR check-in của khách                 | Không |
| GET    | `/api/v1/zalo/vouchers`           | Voucher hiện tại + voucher active        | Không |
| GET    | `/api/v1/zalo/events`             | Danh sách event active (kèm trạng thái đăng ký) | Không |
| POST   | `/api/v1/zalo/register`           | Đăng ký / cập nhật đăng ký sự kiện       | Không |

> Lưu ý: Các endpoint `v1` còn lại (`permissions`, `roles`, `users`, `settings`, `speakers`, `schedules`, `venues`, `hotels`, `galleries`, `sponsors`, `faqs`, `amenities`, `prices`) yêu cầu xác thực `auth:api` và phục vụ cho trang admin, không dùng trong mini app.
