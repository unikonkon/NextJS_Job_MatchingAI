export type JobThaiDetail = {
    id: string; // รหัสตำแหน่งงาน
    url: string; // ลิงก์หน้ารายละเอียดตำแหน่งงานใน jobthai.com (อาจซ้ำกับ jobUrl)
    previewText: string; // ข้อความพรีวิวสั้น ๆ เกี่ยวกับงาน (รวมวันที่, ชื่อตำแหน่ง, บริษัท ฯลฯ)
    title: string; // ชื่อตำแหน่งงาน
    company: string; // ชื่อบริษัทที่ประกาศงาน
    companyLogo: string; // ลิงก์โลโก้บริษัท (ถ้ามี)
    location: string; // สถานที่ปฏิบัติงาน (เช่น เขต/จังหวัด/ชื่อสถานที่)
    salary: string; // เงินเดือน หรือช่วงเงินเดือน (ข้อความดิบ)
    positions: string; // จำนวนตำแหน่งที่เปิดรับ (ข้อความดิบ)
    companyHistory: string; // ข้อมูล/ประวัติบริษัท (ข้อความบรรยาย)
    benefits: string; // สวัสดิการที่ได้รับ (ถ้ามี, ข้อความดิบ)
    contact: string; // ข้อมูลการติดต่อสำหรับสมัครงาน (ชื่อ, เบอร์, เว็บไซต์, ที่อยู่)
    transportation: string; // การเดินทาง/จุดสังเกตใกล้เคียง (ถ้ามี เช่น BTS, MRT)
    jobUrl: string; // ลิงก์ไปหน้ารายละเอียดงานของ jobthai.com (ซ้ำกับ url ในบางกรณี)
    postedDate: string; // วันที่ประกาศงาน (รูปแบบ: "22 ธ.ค. 68")
    scrapedAt: string; // วันที่/เวลาที่ระบบดึงข้อมูล job นี้ ("2025-12-22T04:48:11.703Z")
}

export type JobThai = {
    metadata: {
        totalJobs: number; // จำนวนงานทั้งหมดในระบบ
        lastUpdated: string; // วันที่ที่ดึงข้อมูล (ISO string ของเวลาสุดท้าย)
        version: string; // เวอร์ชั่นของรูปแบบข้อมูล/ไฟล์
    };
    jobs: JobThaiDetail[]; // รายการงานทั้งหมด
}