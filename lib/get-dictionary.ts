import "server-only"
import { sanityClient } from '@/lib/sanity-client'
import { getSiteName } from '@/lib/site-settings'
import { legacyDictionaryMatchesBrand } from '@/sanity/bootstrap/legacyDictionaryBootstrap'

const dictionaries = {
  vi: () => import('@/dictionaries/vi.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  jp: () => import('@/dictionaries/jp.json').then((module) => module.default),
  kr: () => import('@/dictionaries/kr.json').then((module) => module.default),
  cn: () => import('@/dictionaries/cn.json').then((module) => module.default),
}

const neutralLabels: Record<string, Record<string, any>> = {
  vi: {
    navigation: { home: 'Trang chủ', about: 'Giới thiệu', services: 'Dịch vụ', products: 'Sản phẩm', projects: 'Dự án', blog: 'Blog', contact: 'Liên hệ', view_all_services: 'Xem tất cả dịch vụ', view_all_products: 'Xem tất cả sản phẩm', view_all_projects: 'Xem tất cả dự án' },
    common: { home: 'Trang chủ', logo_subtitle: 'Giải pháp kỹ thuật', contact_btn: 'Yêu cầu báo giá', read_more: 'Xem chi tiết', swipe_desktop: 'Trượt trên máy tính' },
    hero: { badge: 'Giải pháp kỹ thuật', title_line1: 'Giải pháp', title_highlight: 'kỹ thuật', title_line2: 'cho doanh nghiệp', description: 'Website doanh nghiệp.', cta_primary: 'Xem dịch vụ', cta_secondary: 'Xem dự án', scroll_text: 'Cuộn xuống', stats: { projects: 'Dự án hoàn thành', experience: 'Năm kinh nghiệm', quality: 'Chất lượng', experts: 'Chuyên gia' } },
    about_summary: { badge: 'Giới thiệu', title_main: 'Thông tin', title_highlight: 'doanh nghiệp', description: 'Thông tin doanh nghiệp đang được cập nhật.', cta_text: 'Tìm hiểu thêm', exp_label: 'Năm kinh nghiệm' },
    about_page: { meta_title: 'Giới thiệu', header_title: 'Giới thiệu', header_subtitle: 'Về chúng tôi', header_top_desc: 'Thông tin về doanh nghiệp, năng lực và định hướng phát triển.', header_desc: 'Thông tin doanh nghiệp đang được cập nhật.', description_2: '', commitment: '' },
    featured_projects: { badge: 'Dự án', title_main: 'Dự án', title_highlight: 'nổi bật', description: 'Các dự án và năng lực tiêu biểu của doanh nghiệp.', view_all: 'Xem tất cả', view_details: 'Xem chi tiết', empty: 'Đang cập nhật dự án.' },
    news_section: { badge: 'Kiến thức & Tin tức', title_main: 'Góc nhìn', title_highlight: 'Chuyên gia', description: 'Cập nhật xu hướng, kiến thức và kinh nghiệm chuyên môn từ đội ngũ của chúng tôi.', view_all: 'Xem tất cả bài viết' },
    services: { title_main: 'Dịch vụ', title_highlight: 'Kỹ thuật', hub_description: 'Khám phá các dịch vụ và giải pháp của doanh nghiệp.', read_more: 'Tìm hiểu chi tiết', meta_title: 'Dịch vụ', meta_desc: 'Danh sách dịch vụ và giải pháp kỹ thuật.' },
    products: { title_main: 'Sản phẩm', title_highlight: 'Danh mục', hub_description: 'Khám phá danh mục sản phẩm của doanh nghiệp.', meta_title: 'Sản phẩm', meta_desc: 'Danh sách sản phẩm của doanh nghiệp.', related_title: 'Sản phẩm liên quan' },
    portfolio: { title: 'Dự án', subtitle: 'Năng lực tiêu biểu', description: 'Khám phá các dự án và năng lực tiêu biểu của doanh nghiệp.', back_to_list: 'Quay lại danh sách', project_info: 'Thông tin dự án', client_label: 'Khách hàng', year_label: 'Năm thực hiện', service_label: 'Dịch vụ', gallery_title: 'Hình ảnh', related_title: 'Dự án liên quan' },
    blog: { title: 'Tin tức', subtitle: 'Kiến thức & cập nhật', description: 'Cập nhật tin tức và kiến thức từ doanh nghiệp.', meta_title: 'Tin tức & Blog', meta_desc: 'Tin tức, kiến thức và cập nhật mới nhất.', read_more: 'Đọc tiếp', back_to_blog: 'Quay lại Blog', no_posts: 'Đang cập nhật bài viết mới...' },
    contact: { title: 'Liên hệ', subtitle: 'Kết nối với chúng tôi', description: 'Liên hệ để trao đổi về nhu cầu và dự án của bạn.' },
    contact_section: { badge: 'Liên hệ', title: 'Yêu cầu', title_highlight: 'báo giá', description: 'Gửi thông tin để chúng tôi có thể hỗ trợ bạn.', working_hours: { title: 'Giờ làm việc', monday_friday: 'Thứ 2 - Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật', closed: 'Nghỉ' }, form: { step: 'Bước', info_title: 'Thông tin liên hệ', service_title: 'Dịch vụ quan tâm', file_title: 'Đính kèm tài liệu', labels: { name: 'Họ và tên *', company: 'Công ty', email: 'Email *', phone: 'Số điện thoại *', service: 'Chọn dịch vụ *', message: 'Mô tả yêu cầu', file: 'Đính kèm tài liệu' }, placeholders: { name: 'Họ và tên', company: 'Tên công ty', email: 'email@company.com', phone: 'Số điện thoại', service_default: '-- Chọn dịch vụ --', message: 'Mô tả yêu cầu...', file_hint: 'Kéo thả file hoặc chọn file', file_types: 'Tệp tài liệu kỹ thuật' }, buttons: { next: 'Tiếp theo', prev: 'Quay lại', submit: 'Gửi yêu cầu' }, success_msg: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm.' } },
    footer: { description: 'Đối tác cung cấp sản phẩm và giải pháp kỹ thuật cho khách hàng.', quick_links: 'Liên kết nhanh', newsletter: 'Bản tin', newsletter_desc: 'Đăng ký nhận cập nhật mới nhất.', placeholder_email: 'Email của bạn', privacy_policy: 'Chính sách bảo mật', terms_of_use: 'Điều khoản sử dụng', cookie_policy: 'Chính sách cookie' },
  },
  en: {
    navigation: { home: 'Home', about: 'About', services: 'Services', products: 'Products', projects: 'Projects', blog: 'Blog', contact: 'Contact', view_all_services: 'View all services', view_all_products: 'View all products', view_all_projects: 'View all projects' },
    common: { home: 'Home', logo_subtitle: 'Engineering Solutions', contact_btn: 'Request a Quote', read_more: 'Read More', swipe_desktop: 'Swipe on desktop' },
    hero: { badge: 'Engineering Solutions', title_line1: 'Engineering', title_highlight: 'Solutions', title_line2: 'for Business', description: 'Corporate website.', cta_primary: 'View Services', cta_secondary: 'View Projects', scroll_text: 'Scroll down', stats: { projects: 'Projects Completed', experience: 'Years Experience', quality: 'Quality', experts: 'Experts' } },
    about_summary: { badge: 'About', title_main: 'Company', title_highlight: 'Overview', description: 'Company information is being updated.', cta_text: 'Learn More', exp_label: 'Years Experience' },
    about_page: { meta_title: 'About', header_title: 'About Us', header_subtitle: 'Company Overview', header_top_desc: 'Information about the company, capabilities and direction.', header_desc: 'Company information is being updated.', description_2: '', commitment: '' },
    featured_projects: { badge: 'Projects', title_main: 'Featured', title_highlight: 'Projects', description: 'Selected projects and capabilities of the company.', view_all: 'View All', view_details: 'View Details', empty: 'Projects are being updated.' },
    news_section: { badge: 'Knowledge & News', title_main: 'Expert', title_highlight: 'Insights', description: 'Updates, knowledge and professional insights from our team.', view_all: 'View All Articles' },
    services: { title_main: 'Technical', title_highlight: 'Services', hub_description: 'Explore the company’s services and solutions.', read_more: 'Learn More', meta_title: 'Services', meta_desc: 'Technical services and solutions.' },
    products: { title_main: 'Products', title_highlight: 'Catalog', hub_description: 'Explore the company’s product catalog.', meta_title: 'Products', meta_desc: 'Company product catalog.', related_title: 'Related Products' },
    portfolio: { title: 'Projects', subtitle: 'Selected Work', description: 'Explore selected projects and company capabilities.', back_to_list: 'Back to Projects', project_info: 'Project Information', client_label: 'Client', year_label: 'Year', service_label: 'Service', gallery_title: 'Gallery', related_title: 'Related Projects' },
    blog: { title: 'News', subtitle: 'Knowledge & Updates', description: 'Latest news and knowledge from the company.', meta_title: 'News & Blog', meta_desc: 'Latest news, knowledge and updates.', read_more: 'Read More', back_to_blog: 'Back to Blog', no_posts: 'New articles are coming soon...' },
    contact: { title: 'Contact', subtitle: 'Get in Touch', description: 'Contact us to discuss your requirements and project.' },
    contact_section: { badge: 'Contact', title: 'Request a', title_highlight: 'Quote', description: 'Send your details and our team will get back to you.', working_hours: { title: 'Working Hours', monday_friday: 'Monday - Friday', saturday: 'Saturday', sunday: 'Sunday', closed: 'Closed' }, form: { step: 'Step', info_title: 'Contact Information', service_title: 'Service of Interest', file_title: 'Attachments', labels: { name: 'Full Name *', company: 'Company', email: 'Email *', phone: 'Phone *', service: 'Select Service *', message: 'Project Details', file: 'Attach Files' }, placeholders: { name: 'Full name', company: 'Company name', email: 'email@company.com', phone: 'Phone number', service_default: '-- Select service --', message: 'Describe your requirements...', file_hint: 'Drop files here or choose a file', file_types: 'Technical document files' }, buttons: { next: 'Next', prev: 'Back', submit: 'Submit Request' }, success_msg: 'Thank you! We will get back to you soon.' } },
    footer: { description: 'A partner providing products and engineering solutions for customers.', quick_links: 'Quick Links', newsletter: 'Newsletter', newsletter_desc: 'Subscribe for the latest updates.', placeholder_email: 'Your email address', privacy_policy: 'Privacy Policy', terms_of_use: 'Terms of Use', cookie_policy: 'Cookie Policy' },
  },
  jp: {
    navigation: { home: 'ホーム', about: '会社情報', services: 'サービス', products: '製品', projects: 'プロジェクト', blog: 'ブログ', contact: 'お問い合わせ', view_all_services: 'すべてのサービス', view_all_products: 'すべての製品', view_all_projects: 'すべてのプロジェクト' },
    common: { home: 'ホーム', logo_subtitle: 'エンジニアリングソリューション', contact_btn: '見積もり依頼', read_more: '詳細を見る', swipe_desktop: 'デスクトップでスワイプ' },
    hero: { badge: 'エンジニアリングソリューション', title_line1: 'エンジニアリング', title_highlight: 'ソリューション', title_line2: 'ビジネス向け', description: '企業ウェブサイト。', cta_primary: 'サービスを見る', cta_secondary: 'プロジェクトを見る', scroll_text: '下へスクロール', stats: { projects: '完了プロジェクト', experience: '年の経験', quality: '品質', experts: '専門家' } },
    about_summary: { badge: '会社情報', title_main: '会社', title_highlight: '概要', description: '会社情報を更新中です。', cta_text: '詳しく見る', exp_label: '年の経験' },
    about_page: { meta_title: '会社情報', header_title: '会社情報', header_subtitle: '会社概要', header_top_desc: '会社、技術力、今後の方向性に関する情報です。', header_desc: '会社情報を更新中です。', description_2: '', commitment: '' },
    featured_projects: { badge: 'プロジェクト', title_main: '注目', title_highlight: 'プロジェクト', description: '会社の代表的なプロジェクトと技術力をご紹介します。', view_all: 'すべて見る', view_details: '詳細を見る', empty: 'プロジェクトを更新中です。' },
    news_section: { badge: '知識・ニュース', title_main: '専門家の', title_highlight: '知見', description: '当社チームから最新情報、知識、専門的な知見をお届けします。', view_all: 'すべての記事を見る' },
    services: { title_main: '技術', title_highlight: 'サービス', hub_description: '会社のサービスとソリューションをご覧ください。', read_more: '詳細を見る', meta_title: 'サービス', meta_desc: '技術サービスとソリューション。' },
    products: { title_main: '製品', title_highlight: '一覧', hub_description: '会社の製品一覧をご覧ください。', meta_title: '製品', meta_desc: '会社の製品一覧。', related_title: '関連製品' },
    portfolio: { title: 'プロジェクト', subtitle: '実績', description: '代表的なプロジェクトと会社の技術力をご覧ください。', back_to_list: '一覧へ戻る', project_info: 'プロジェクト情報', client_label: '顧客', year_label: '年', service_label: 'サービス', gallery_title: 'ギャラリー', related_title: '関連プロジェクト' },
    blog: { title: 'ニュース', subtitle: '知識・最新情報', description: '会社からのニュースと知識をお届けします。', meta_title: 'ニュース・ブログ', meta_desc: '最新ニュース、知識、更新情報。', read_more: '続きを読む', back_to_blog: 'ブログへ戻る', no_posts: '新しい記事を準備中です。' },
    contact: { title: 'お問い合わせ', subtitle: 'ご相談ください', description: 'ご要望やプロジェクトについてお気軽にお問い合わせください。' },
    contact_section: { badge: 'お問い合わせ', title: 'お見積もり', title_highlight: '依頼', description: '必要事項をご入力ください。担当者よりご連絡します。', working_hours: { title: '営業時間', monday_friday: '月曜日 - 金曜日', saturday: '土曜日', sunday: '日曜日', closed: '休業' }, form: { step: 'ステップ', info_title: '連絡先情報', service_title: 'ご希望のサービス', file_title: '添付ファイル', labels: { name: 'お名前 *', company: '会社名', email: 'メール *', phone: '電話番号 *', service: 'サービスを選択 *', message: 'ご要望', file: 'ファイルを添付' }, placeholders: { name: 'お名前', company: '会社名', email: 'email@company.com', phone: '電話番号', service_default: '-- サービスを選択 --', message: 'ご要望をご記入ください...', file_hint: 'ファイルをドロップまたは選択', file_types: '技術資料ファイル' }, buttons: { next: '次へ', prev: '戻る', submit: '送信' }, success_msg: 'ありがとうございます。近日中にご連絡します。' } },
    footer: { description: 'お客様に製品とエンジニアリングソリューションを提供するパートナーです。', quick_links: 'クイックリンク', newsletter: 'ニュースレター', newsletter_desc: '最新情報を受け取るために登録してください。', placeholder_email: 'メールアドレス', privacy_policy: 'プライバシーポリシー', terms_of_use: '利用規約', cookie_policy: 'Cookieポリシー' },
  },
  kr: {
    navigation: { home: '홈', about: '회사소개', services: '서비스', products: '제품', projects: '프로젝트', blog: '블로그', contact: '문의', view_all_services: '모든 서비스 보기', view_all_products: '모든 제품 보기', view_all_projects: '모든 프로젝트 보기' },
    common: { home: '홈', logo_subtitle: '엔지니어링 솔루션', contact_btn: '견적 요청', read_more: '자세히 보기', swipe_desktop: '데스크톱에서 스와이프' },
    hero: { badge: '엔지니어링 솔루션', title_line1: '엔지니어링', title_highlight: '솔루션', title_line2: '비즈니스를 위한', description: '기업 웹사이트입니다.', cta_primary: '서비스 보기', cta_secondary: '프로젝트 보기', scroll_text: '아래로 스크롤', stats: { projects: '완료 프로젝트', experience: '경력 연수', quality: '품질', experts: '전문가' } },
    about_summary: { badge: '회사소개', title_main: '회사', title_highlight: '개요', description: '회사 정보를 업데이트 중입니다.', cta_text: '자세히 보기', exp_label: '경력 연수' },
    about_page: { meta_title: '회사소개', header_title: '회사소개', header_subtitle: '회사 개요', header_top_desc: '회사, 역량 및 향후 방향에 대한 정보입니다.', header_desc: '회사 정보를 업데이트 중입니다.', description_2: '', commitment: '' },
    featured_projects: { badge: '프로젝트', title_main: '주요', title_highlight: '프로젝트', description: '회사의 주요 프로젝트와 역량을 소개합니다.', view_all: '모두 보기', view_details: '자세히 보기', empty: '프로젝트를 업데이트 중입니다.' },
    news_section: { badge: '지식 및 뉴스', title_main: '전문가', title_highlight: '인사이트', description: '팀의 최신 정보, 지식 및 전문 인사이트를 제공합니다.', view_all: '모든 글 보기' },
    services: { title_main: '기술', title_highlight: '서비스', hub_description: '회사의 서비스와 솔루션을 확인하세요.', read_more: '자세히 보기', meta_title: '서비스', meta_desc: '기술 서비스 및 솔루션.' },
    products: { title_main: '제품', title_highlight: '목록', hub_description: '회사의 제품 목록을 확인하세요.', meta_title: '제품', meta_desc: '회사 제품 목록.', related_title: '관련 제품' },
    portfolio: { title: '프로젝트', subtitle: '주요 실적', description: '주요 프로젝트와 회사의 역량을 확인하세요.', back_to_list: '목록으로 돌아가기', project_info: '프로젝트 정보', client_label: '고객', year_label: '연도', service_label: '서비스', gallery_title: '갤러리', related_title: '관련 프로젝트' },
    blog: { title: '뉴스', subtitle: '지식 및 업데이트', description: '회사의 최신 뉴스와 지식을 제공합니다.', meta_title: '뉴스 및 블로그', meta_desc: '최신 뉴스, 지식 및 업데이트.', read_more: '더 읽기', back_to_blog: '블로그로 돌아가기', no_posts: '새 글을 준비 중입니다.' },
    contact: { title: '문의', subtitle: '문의하기', description: '요구사항과 프로젝트에 대해 문의해 주세요.' },
    contact_section: { badge: '문의', title: '견적', title_highlight: '요청', description: '정보를 보내주시면 담당자가 연락드리겠습니다.', working_hours: { title: '영업시간', monday_friday: '월요일 - 금요일', saturday: '토요일', sunday: '일요일', closed: '휴무' }, form: { step: '단계', info_title: '연락처 정보', service_title: '관심 서비스', file_title: '첨부 파일', labels: { name: '이름 *', company: '회사명', email: '이메일 *', phone: '전화번호 *', service: '서비스 선택 *', message: '요청 내용', file: '파일 첨부' }, placeholders: { name: '이름', company: '회사명', email: 'email@company.com', phone: '전화번호', service_default: '-- 서비스 선택 --', message: '요청 내용을 입력하세요...', file_hint: '파일을 드롭하거나 선택하세요', file_types: '기술 문서 파일' }, buttons: { next: '다음', prev: '이전', submit: '요청 보내기' }, success_msg: '감사합니다. 곧 연락드리겠습니다.' } },
    footer: { description: '고객에게 제품과 엔지니어링 솔루션을 제공하는 파트너입니다.', quick_links: '빠른 링크', newsletter: '뉴스레터', newsletter_desc: '최신 소식을 받아보세요.', placeholder_email: '이메일 주소', privacy_policy: '개인정보 처리방침', terms_of_use: '이용 약관', cookie_policy: '쿠키 정책' },
  },
  cn: {
    navigation: { home: '首页', about: '关于我们', services: '服务', products: '产品', projects: '项目', blog: '博客', contact: '联系我们', view_all_services: '查看全部服务', view_all_products: '查看全部产品', view_all_projects: '查看全部项目' },
    common: { home: '首页', logo_subtitle: '工程解决方案', contact_btn: '获取报价', read_more: '查看详情', swipe_desktop: '桌面端滑动' },
    hero: { badge: '工程解决方案', title_line1: '工程', title_highlight: '解决方案', title_line2: '助力企业', description: '企业网站。', cta_primary: '查看服务', cta_secondary: '查看项目', scroll_text: '向下滚动', stats: { projects: '已完成项目', experience: '经验年限', quality: '质量', experts: '专家团队' } },
    about_summary: { badge: '关于我们', title_main: '公司', title_highlight: '概览', description: '公司信息正在更新中。', cta_text: '了解更多', exp_label: '经验年限' },
    about_page: { meta_title: '关于我们', header_title: '关于我们', header_subtitle: '公司概览', header_top_desc: '公司、能力与发展方向信息。', header_desc: '公司信息正在更新中。', description_2: '', commitment: '' },
    featured_projects: { badge: '项目', title_main: '精选', title_highlight: '项目', description: '展示公司的代表性项目与能力。', view_all: '查看全部', view_details: '查看详情', empty: '项目正在更新中。' },
    news_section: { badge: '知识与资讯', title_main: '专家', title_highlight: '洞察', description: '来自团队的最新资讯、知识与专业洞察。', view_all: '查看全部文章' },
    services: { title_main: '技术', title_highlight: '服务', hub_description: '了解公司的服务与解决方案。', read_more: '了解详情', meta_title: '服务', meta_desc: '技术服务与解决方案。' },
    products: { title_main: '产品', title_highlight: '目录', hub_description: '浏览公司的产品目录。', meta_title: '产品', meta_desc: '公司产品目录。', related_title: '相关产品' },
    portfolio: { title: '项目', subtitle: '精选案例', description: '浏览代表性项目与公司能力。', back_to_list: '返回项目列表', project_info: '项目信息', client_label: '客户', year_label: '年份', service_label: '服务', gallery_title: '图片', related_title: '相关项目' },
    blog: { title: '资讯', subtitle: '知识与更新', description: '获取公司的最新资讯与知识。', meta_title: '资讯与博客', meta_desc: '最新资讯、知识与更新。', read_more: '阅读全文', back_to_blog: '返回博客', no_posts: '新文章正在准备中。' },
    contact: { title: '联系我们', subtitle: '与我们联系', description: '欢迎联系我们讨论您的需求与项目。' },
    contact_section: { badge: '联系我们', title: '获取', title_highlight: '报价', description: '提交您的信息，我们会尽快与您联系。', working_hours: { title: '工作时间', monday_friday: '周一 - 周五', saturday: '周六', sunday: '周日', closed: '休息' }, form: { step: '步骤', info_title: '联系信息', service_title: '感兴趣的服务', file_title: '附件', labels: { name: '姓名 *', company: '公司', email: '邮箱 *', phone: '电话 *', service: '选择服务 *', message: '需求说明', file: '上传文件' }, placeholders: { name: '姓名', company: '公司名称', email: 'email@company.com', phone: '电话号码', service_default: '-- 选择服务 --', message: '请描述您的需求...', file_hint: '拖放文件或选择文件', file_types: '技术文档文件' }, buttons: { next: '下一步', prev: '返回', submit: '提交需求' }, success_msg: '感谢您的联系，我们会尽快回复。' } },
    footer: { description: '为客户提供产品与工程解决方案的合作伙伴。', quick_links: '快速链接', newsletter: '电子简报', newsletter_desc: '订阅以获取最新动态。', placeholder_email: '您的邮箱', privacy_policy: '隐私政策', terms_of_use: '使用条款', cookie_policy: 'Cookie 政策' },
  },
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge<T>(base: T, override: any): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T
  const output: Record<string, any> = { ...(base as Record<string, any>) }
  for (const [key, value] of Object.entries(override)) {
    output[key] = isPlainObject(output[key]) && isPlainObject(value) ? deepMerge(output[key], value) : value
  }
  return output as T
}

function neutralize(value: any): any {
  if (typeof value === 'string') return ''
  if (Array.isArray(value)) return []
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, neutralize(item)]))
  return value
}

async function getDynamicPageContent(locale: string) {
  try {
    const rows = await sanityClient.fetch<Array<{ key?: string; content?: string }>>(
      `*[_type == "pageContent" && language == $locale && defined(key) && defined(content) && !(_id in path("drafts.**"))]{key,content}`,
      { locale },
      { next: { revalidate: 60, tags: [`page-content-${locale}`] } },
    )
    return rows.reduce((output: Record<string, any>, row) => {
      if (!row?.key || !row?.content) return output
      try {
        const parsed = JSON.parse(row.content)
        output[row.key] = isPlainObject(parsed?.[row.key]) ? parsed[row.key] : parsed
      } catch {
        console.warn(`⚠️ pageContent/${row.key} [${locale}] không phải JSON hợp lệ, bỏ qua document này.`)
      }
      return output
    }, {})
  } catch {
    console.warn(`⚠️ Không thể tải pageContent từ Sanity cho [${locale}].`)
    return {}
  }
}

async function useLegacyFallback() {
  try {
    return legacyDictionaryMatchesBrand(await getSiteName())
  } catch {
    return false
  }
}

export const getDictionary = async (locale: string) => {
  const safeLocale = locale in dictionaries ? locale : 'vi'
  if (!(locale in dictionaries) && !locale.includes('.') && locale !== 'favicon.ico' && locale !== 'studio' && locale.length <= 5) {
    console.warn(`⚠️ Ngôn ngữ [${locale}] không hỗ trợ, dùng mặc định [vi]`)
  }

  const loadDictionary = dictionaries[safeLocale as keyof typeof dictionaries]
  const [bundledDictionary, dynamicSections, legacyAllowed] = await Promise.all([
    loadDictionary(),
    getDynamicPageContent(safeLocale),
    useLegacyFallback(),
  ])

  const baseDictionary = legacyAllowed
    ? bundledDictionary
    : deepMerge(neutralize(bundledDictionary), neutralLabels[safeLocale] || neutralLabels.vi)

  return deepMerge(baseDictionary, dynamicSections)
}
