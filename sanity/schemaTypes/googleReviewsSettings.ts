const localizedTextFields = [
  { name: 'vi', title: 'Tiếng Việt', type: 'string' },
  { name: 'en', title: 'English', type: 'string' },
  { name: 'jp', title: '日本語', type: 'string' },
  { name: 'kr', title: '한국어', type: 'string' },
  { name: 'cn', title: '中文', type: 'string' },
]

const localizedLongTextFields = [
  { name: 'vi', title: 'Tiếng Việt', type: 'text', rows: 4 },
  { name: 'en', title: 'English', type: 'text', rows: 4 },
  { name: 'jp', title: '日本語', type: 'text', rows: 4 },
  { name: 'kr', title: '한국어', type: 'text', rows: 4 },
  { name: 'cn', title: '中文', type: 'text', rows: 4 },
]

export default {
  name: 'googleReviewsSettings',
  title: 'Đánh giá Google hiển thị trên website',
  type: 'document',
  description: 'Quản lý toàn bộ Google Maps, điểm đánh giá, tổng số đánh giá, nội dung giao diện và bản dịch đánh giá trong một mục duy nhất.',
  initialValue: {
    enabled: false,
    badge: {
      vi: 'Khách hàng',
      en: 'Testimonials',
      jp: 'お客様の声',
      kr: '고객 후기',
      cn: '客户见证',
    },
    titlePart1: {
      vi: 'Đối tác',
      en: 'Trusted',
      jp: '信頼される',
      kr: '신뢰할 수 있는',
      cn: '可靠的',
    },
    titleHighlight: {
      vi: 'tin cậy',
      en: 'Partners',
      jp: 'パートナー',
      kr: '파트너',
      cn: '合作伙伴',
    },
    description: {
      vi: 'Đánh giá từ khách hàng và đối tác.',
      en: 'Feedback from customers and partners.',
      jp: 'お客様とパートナーからの評価。',
      kr: '고객 및 파트너의 후기입니다.',
      cn: '来自客户和合作伙伴的评价。',
    },
    reviewsLabel: {
      vi: 'đánh giá trên Google',
      en: 'reviews on Google',
      jp: 'Google のクチコミ',
      kr: 'Google 리뷰',
      cn: 'Google 评价',
    },
    viewGoogleLabel: {
      vi: 'Xem trên Google',
      en: 'View on Google',
      jp: 'Googleで見る',
      kr: 'Google에서 보기',
      cn: '在 Google 上查看',
    },
    googleReviews: [],
  },
  fields: [
    { name: 'enabled', title: 'Hiển thị khối Google Reviews', type: 'boolean', initialValue: false },
    { name: 'badge', title: 'Nhãn nhỏ · 5 ngôn ngữ', type: 'object', fields: localizedTextFields },
    { name: 'titlePart1', title: 'Tiêu đề phần 1 · 5 ngôn ngữ', type: 'object', fields: localizedTextFields },
    { name: 'titleHighlight', title: 'Tiêu đề nhấn mạnh · 5 ngôn ngữ', type: 'object', fields: localizedTextFields },
    { name: 'description', title: 'Mô tả · 5 ngôn ngữ', type: 'object', fields: localizedLongTextFields.map((field) => ({ ...field, rows: 2 })) },
    { name: 'reviewsLabel', title: 'Nhãn số lượng đánh giá · 5 ngôn ngữ', type: 'object', fields: localizedTextFields },
    { name: 'viewGoogleLabel', title: 'Nút xem trên Google · 5 ngôn ngữ', type: 'object', fields: localizedTextFields },
    {
      name: 'googleMapsUrl',
      title: 'Liên kết Google Maps',
      type: 'url',
      description: 'Dán link Share từ Google Maps. Người dùng bấm địa chỉ hoặc nút MAP sẽ mở link này.',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'googleRating',
      title: 'Điểm đánh giá Google',
      type: 'number',
      description: 'Ví dụ: 5 hoặc 4.9. Chỉ dùng để hiển thị, không gọi Google API.',
      validation: (Rule: any) => Rule.min(0).max(5),
    },
    {
      name: 'googleReviewCount',
      title: 'Tổng số đánh giá Google',
      type: 'number',
      description: 'Ví dụ: 20. Cập nhật thủ công khi số lượng trên Google thay đổi.',
      validation: (Rule: any) => Rule.min(0).integer(),
    },
    {
      name: 'googleReviews',
      title: 'Đánh giá Google hiển thị trên website',
      type: 'array',
      description: 'Mỗi đánh giá nhập một lần và quản lý luôn 5 bản dịch Việt / Anh / Nhật / Hàn / Trung.',
      of: [
        {
          type: 'object',
          name: 'googleReview',
          title: 'Đánh giá Google',
          fields: [
            { name: 'author', title: 'Tên người đánh giá', type: 'string', validation: (Rule: any) => Rule.required().max(100) },
            { name: 'rating', title: 'Số sao', type: 'number', initialValue: 5, validation: (Rule: any) => Rule.min(1).max(5) },
            {
              name: 'content',
              title: 'Nội dung đánh giá · 5 ngôn ngữ',
              type: 'object',
              description: 'Tiếng Việt là nội dung gốc hiện tại; các ô còn lại là bản dịch hiển thị theo ngôn ngữ website.',
              fields: localizedLongTextFields,
              validation: (Rule: any) => Rule.required(),
            },
            { name: 'meta', title: 'Thông tin phụ', type: 'string', description: 'Ví dụ: Local Guide · 3 reviews' },
            { name: 'reviewUrl', title: 'Link đánh giá trên Google', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
          ],
          preview: {
            select: { title: 'author', subtitle: 'content.vi', rating: 'rating' },
            prepare({ title, subtitle, rating }: any) {
              return { title: `${title || 'Google user'} · ${rating || 5}★`, subtitle }
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: 'Đánh giá Google hiển thị trên website' }
    },
  },
}
