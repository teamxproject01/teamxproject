export type Lang = 'en' | 'zh';

const translations = {
  // Nav
  nav_about:      { en: 'About',       zh: '关于我们' },
  nav_courses:    { en: 'Courses',     zh: '课程' },
  nav_admissions: { en: 'Admissions',  zh: '招生' },
  nav_contact:    { en: 'Contact',     zh: '联系我们' },
  nav_signin:     { en: 'Sign In',     zh: '登录' },
  nav_apply:      { en: 'Apply Now',   zh: '立即申请' },
  nav_dashboard:  { en: 'Dashboard',   zh: '仪表板' },
  nav_profile:    { en: 'My Profile',  zh: '我的主页' },
  nav_signout:    { en: 'Sign Out',    zh: '退出登录' },

  // Home hero slides
  home_slide1_tag:  { en: 'Welcome to MIHE',                         zh: '欢迎来到墨尔本国际高等教育学院' },
  home_slide1_h1:   { en: 'Shape Your',                              zh: '塑造您的' },
  home_slide1_h2:   { en: 'Future Today',                            zh: '未来从今天开始' },
  home_slide1_sub:  { en: 'World-class education at the heart of Melbourne CBD with globally recognised qualifications.', zh: '在墨尔本CBD中心享受世界一流的教育，获得全球认可的学历。' },
  home_slide1_cta:  { en: 'Explore Courses',                         zh: '探索课程' },
  home_slide1_cta2: { en: 'Apply Now',                               zh: '立即申请' },

  home_slide2_tag:  { en: 'Global Community',                        zh: '全球社区' },
  home_slide2_h1:   { en: 'Students From',                           zh: '来自' },
  home_slide2_h2:   { en: '40+ Countries',                           zh: '40多个国家的学生' },
  home_slide2_sub:  { en: 'A vibrant multicultural campus where diverse perspectives fuel innovation and global careers.', zh: '充满活力的多元文化校园，多元视角推动创新与全球职业发展。' },
  home_slide2_cta:  { en: 'Our Community',                           zh: '我们的社区' },
  home_slide2_cta2: { en: 'Learn More',                              zh: '了解更多' },

  home_slide3_tag:  { en: 'Career Ready',                            zh: '职业就绪' },
  home_slide3_h1:   { en: 'Industry-Led',                            zh: '行业主导的' },
  home_slide3_h2:   { en: 'Curriculum',                              zh: '课程体系' },
  home_slide3_sub:  { en: 'Practical, hands-on learning designed with industry partners to launch careers from day one.', zh: '与行业合作伙伴共同设计的实践性学习，从第一天起就为职业生涯奠定基础。' },
  home_slide3_cta:  { en: 'View Programs',                           zh: '查看项目' },
  home_slide3_cta2: { en: 'Industry Partners',                       zh: '行业合作伙伴' },

  home_slide4_tag:  { en: 'Research & Innovation',                   zh: '研究与创新' },
  home_slide4_h1:   { en: 'Pioneering',                              zh: '开创性的' },
  home_slide4_h2:   { en: 'Research Excellence',                     zh: '卓越研究' },
  home_slide4_sub:  { en: 'Join leading researchers pushing boundaries across business, technology, and health sciences.', zh: '加入领先的研究人员，在商业、技术和健康科学领域突破边界。' },
  home_slide4_cta:  { en: 'Research Areas',                          zh: '研究领域' },
  home_slide4_cta2: { en: 'Our Faculty',                             zh: '我们的教师' },

  home_slide5_tag:  { en: 'Scholarships Available',                  zh: '奖学金开放申请' },
  home_slide5_h1:   { en: 'Invest In Your',                          zh: '投资您的' },
  home_slide5_h2:   { en: 'Education',                               zh: '教育' },
  home_slide5_sub:  { en: 'Merit-based scholarships up to $15,000 available for domestic and international students.', zh: '为国内外学生提供最高15,000澳元的奖学金。' },
  home_slide5_cta:  { en: 'View Scholarships',                       zh: '查看奖学金' },
  home_slide5_cta2: { en: 'Apply Today',                             zh: '今日申请' },

  // Home stats
  home_stat1_label: { en: 'Enrolled Students',   zh: '在校学生' },
  home_stat2_label: { en: 'Partner Employers',   zh: '合作雇主' },
  home_stat3_label: { en: 'Graduate Outcomes',   zh: '毕业生就业率' },
  home_stat4_label: { en: 'Nationalities',        zh: '国籍' },

  // Home badges
  home_badge_campus:  { en: 'Melbourne CBD Campus',        zh: '墨尔本CBD校区' },
  home_badge_intakes: { en: 'January & July Intakes',      zh: '一月和七月入学' },
  home_badge_consult: { en: 'Free Consultation',           zh: '免费咨询' },

  // Home perks
  home_perks_tag:   { en: 'Why Choose MIHE',               zh: '为何选择MIHE' },
  home_perks_title: { en: 'The MIHE Advantage',            zh: 'MIHE的优势' },
  home_perks_sub:   { en: 'Everything you need for a successful academic and professional journey.', zh: '为您的学术和职业成功之旅提供一切所需。' },
  home_perk1:       { en: 'Industry-Connected Faculty',    zh: '行业联系紧密的教师' },
  home_perk1_desc:  { en: 'Learn from practitioners with real-world experience across leading Australian companies.', zh: '向在澳大利亚领先企业拥有实际经验的从业者学习。' },
  home_perk2:       { en: 'Flexible Study Modes',          zh: '灵活的学习模式' },
  home_perk2_desc:  { en: 'Choose from on-campus, online, or blended learning to suit your lifestyle.', zh: '选择校园、在线或混合学习模式，适合您的生活方式。' },
  home_perk3:       { en: 'Career Services',               zh: '职业服务' },
  home_perk3_desc:  { en: 'Dedicated career advisors, employer connections, and internship placements from day one.', zh: '专属职业顾问、雇主资源和实习安排，从入学第一天开始。' },
  home_perk4:       { en: 'Student Support',               zh: '学生支持' },
  home_perk4_desc:  { en: 'Comprehensive wellbeing, academic, and financial support for every student.', zh: '为每位学生提供全面的健康、学业和财务支持。' },

  // Home shorts
  home_shorts_tag:   { en: 'MIHE in Motion',               zh: 'MIHE动态' },
  home_shorts_title: { en: 'Featured Talks',               zh: '精选演讲' },
  home_shorts_sub:   { en: 'Watch inspiring talks that bring our community to life.', zh: '观看激励人心的演讲，感受我们社区的活力。' },

  // Home courses
  home_courses_tag:   { en: 'Our Programs',                zh: '我们的项目' },
  home_courses_title: { en: 'Featured Courses',            zh: '精选课程' },
  home_courses_sub:   { en: 'Explore our most popular programs designed for career success.', zh: '探索我们为职业成功设计的最受欢迎项目。' },
  home_course_dur:    { en: 'Duration',                    zh: '课程时长' },
  home_course_btn:    { en: 'Learn More',                  zh: '了解更多' },
  home_courses_cta:   { en: 'View All Courses',            zh: '查看所有课程' },

  // Home testimonials
  home_test_tag:   { en: 'Student Stories',                zh: '学生故事' },
  home_test_title: { en: 'What Our Students Say',          zh: '我们学生的心声' },
  home_test_sub:   { en: 'Hear from students who have transformed their careers at MIHE.', zh: '听听在MIHE实现职业转型的学生怎么说。' },

  // Home CTA
  home_cta_title: { en: 'Ready to Begin Your Journey?',   zh: '准备好开始您的旅程了吗？' },
  home_cta_sub:   { en: "Join 8,400+ students from 40+ countries at Melbourne's most dynamic higher education institution.", zh: '加入来自40多个国家的8,400多名学生，在墨尔本最具活力的高等教育机构学习。' },
  home_cta_btn1:  { en: 'Apply Now',                       zh: '立即申请' },

  // About
  about_tag:          { en: 'About MIHE',                  zh: '关于MIHE' },
  about_h1:           { en: 'Shaping Leaders for',         zh: '培养面向' },
  about_h1_accent:    { en: 'a Global Future',             zh: '全球未来的领导者' },
  about_sub:          { en: 'Melbourne Institute of Higher Education is a leading Australian provider committed to academic excellence, innovation, and student success.', zh: '墨尔本高等教育学院是澳大利亚领先的教育机构，致力于学术卓越、创新和学生成功。' },
  about_quote:        { en: '"Education is the most powerful tool you can use to change the world."', zh: '"教育是您能用来改变世界的最强大工具。"' },
  about_mvv_tag:      { en: 'Our Foundation',              zh: '我们的基础' },
  about_mvv_title:    { en: 'Mission, Vision & Values',    zh: '使命、愿景与价值观' },
  about_mission_t:    { en: 'Our Mission',                 zh: '我们的使命' },
  about_mission_d:    { en: 'To provide accessible, high-quality education that empowers students to achieve their full potential and contribute meaningfully to society.', zh: '提供优质、可及的教育，使学生充分发挥潜力，为社会做出有意义的贡献。' },
  about_vision_t:     { en: 'Our Vision',                  zh: '我们的愿景' },
  about_vision_d:     { en: 'To be recognised as Australia\'s most student-centred higher education provider, celebrated for innovation, diversity, and global impact.', zh: '成为澳大利亚最以学生为中心的高等教育提供商，以创新、多元和全球影响力著称。' },
  about_values_t:     { en: 'Our Values',                  zh: '我们的价值观' },
  about_values_d:     { en: 'Excellence, Integrity, Innovation, Diversity, and Student Success guide every decision we make.', zh: '卓越、诚信、创新、多元化和学生成功指导我们做出的每一个决定。' },
  about_stats1:       { en: 'Students Enrolled',           zh: '在校学生' },
  about_stats2:       { en: 'Nationalities',               zh: '国籍' },
  about_stats3:       { en: 'Years of Excellence',         zh: '卓越年数' },
  about_stats4:       { en: 'Industry Partners',           zh: '行业合作伙伴' },
  about_history_tag:  { en: 'Our Journey',                 zh: '我们的历程' },
  about_history_title:{ en: 'A History of Excellence',     zh: '卓越的历史' },
  about_history_sub:  { en: 'From humble beginnings to a globally recognised institution.', zh: '从小小的起步到全球知名的机构。' },
  about_team_tag:     { en: 'Our People',                  zh: '我们的人才' },
  about_team_title:   { en: 'Leadership Team',             zh: '领导团队' },
  about_team_sub:     { en: 'Experienced educators and industry leaders guiding MIHE\'s future.', zh: '经验丰富的教育工作者和行业领袖引领MIHE的未来。' },
  about_apply:        { en: 'Apply Now',                   zh: '立即申请' },
  about_explore:      { en: 'Explore Courses',             zh: '探索课程' },

  // Admissions
  adm_tag:         { en: 'Admissions',                     zh: '招生' },
  adm_h1:          { en: 'Start Your',                     zh: '开始您的' },
  adm_h1_accent:   { en: 'Application',                    zh: '申请之旅' },
  adm_sub:         { en: 'Follow our simple application process and take the first step toward your future at MIHE.', zh: '按照我们简单的申请流程，迈出在MIHE未来的第一步。' },
  adm_steps_tag:   { en: 'How to Apply',                   zh: '如何申请' },
  adm_steps_title: { en: 'Application Process',            zh: '申请流程' },
  adm_step1_t:     { en: 'Choose Your Course',             zh: '选择您的课程' },
  adm_step1_d:     { en: 'Browse our programs and find the course that aligns with your goals and interests.', zh: '浏览我们的项目，找到与您目标和兴趣相符的课程。' },
  adm_step2_t:     { en: 'Check Requirements',             zh: '检查入学要求' },
  adm_step2_d:     { en: 'Review entry requirements including academic qualifications and English proficiency.', zh: '查看入学要求，包括学术资质和英语水平。' },
  adm_step3_t:     { en: 'Submit Application',             zh: '提交申请' },
  adm_step3_d:     { en: 'Complete the online application form and upload your supporting documents.', zh: '填写在线申请表并上传支持文件。' },
  adm_step4_t:     { en: 'Receive Offer',                  zh: '收到录取通知' },
  adm_step4_d:     { en: 'Our admissions team will review your application and send a formal offer.', zh: '我们的招生团队将审核您的申请并发送正式录取通知。' },
  adm_step5_t:     { en: 'Enrol & Begin',                  zh: '入学并开始学习' },
  adm_step5_d:     { en: 'Accept your offer, complete enrolment, and start your journey at MIHE.', zh: '接受录取通知，完成入学手续，开始您在MIHE的旅程。' },
  adm_req_tag:     { en: 'Entry Requirements',             zh: '入学要求' },
  adm_req_title:   { en: 'What You Need to Apply',         zh: '申请所需条件' },
  adm_domestic:    { en: 'Domestic Students',              zh: '国内学生' },
  adm_intl:        { en: 'International Students',         zh: '国际学生' },
  adm_intakes_tag:   { en: 'Intakes',                      zh: '入学期' },
  adm_intakes_title: { en: 'Upcoming Intakes',             zh: '即将到来的入学期' },

  // Courses
  courses_tag:      { en: 'Our Programs',                  zh: '我们的项目' },
  courses_h1:       { en: 'Explore Our',                   zh: '探索我们的' },
  courses_h1_accent:{ en: 'Courses',                       zh: '课程' },
  courses_sub:      { en: 'Discover programs designed to launch and accelerate your career.', zh: '发现为启动和加速您的职业生涯而设计的项目。' },
  courses_search:   { en: 'Search courses or CRICOS code…', zh: '搜索课程或CRICOS代码…' },
  courses_showing:  { en: 'Showing',                       zh: '显示' },
  courses_of:       { en: 'of',                            zh: '中的' },
  courses_programs: { en: 'programs',                      zh: '个项目' },
  courses_no_match: { en: 'No courses match your search.', zh: '没有与您搜索匹配的课程。' },
  courses_clear:    { en: 'Clear Filters',                 zh: '清除筛选' },
  courses_overview: { en: 'Program Overview',              zh: '项目概述' },
  courses_entry:    { en: 'Entry Requirements',            zh: '入学要求' },
  courses_intakes:  { en: 'Intake Dates',                  zh: '入学日期' },
  courses_careers:  { en: 'Career Outcomes',               zh: '职业前景' },
  courses_fees:     { en: 'Fees (per year)',               zh: '费用（每年）' },
  courses_dom:      { en: 'Domestic',                      zh: '国内学生' },
  courses_intl:     { en: 'International',                 zh: '国际学生' },
  courses_learn:    { en: 'Learn More',                    zh: '了解更多' },
  courses_apply:    { en: 'Apply Now',                     zh: '立即申请' },

  // Contact
  contact_tag:        { en: 'Get in Touch',                zh: '联系我们' },
  contact_h1:         { en: 'We\'re Here to',             zh: '我们随时' },
  contact_h1_accent:  { en: 'Help',                        zh: '为您服务' },
  contact_sub:        { en: 'Have a question about admissions, courses, or student life? Our team is ready to help.', zh: '对招生、课程或学生生活有疑问？我们的团队随时准备为您提供帮助。' },
  contact_name:       { en: 'Full Name',                   zh: '全名' },
  contact_email:      { en: 'Email Address',               zh: '电子邮件地址' },
  contact_phone:      { en: 'Phone',                       zh: '电话' },
  contact_subject:    { en: 'Subject',                     zh: '主题' },
  contact_message:    { en: 'Message',                     zh: '消息' },
  contact_send:       { en: 'Send Message',                zh: '发送消息' },
  contact_sent_title: { en: 'Message Sent!',               zh: '消息已发送！' },
  contact_sent_sub:   { en: 'Thanks for reaching out. We\'ll be in touch within 1–2 business days.', zh: '感谢您的联系。我们将在1-2个工作日内与您联系。' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
