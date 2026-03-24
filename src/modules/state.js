import { reactive } from 'vue'

export const state = reactive({
  currentStyleId: 1,
  customNum: '092',
  customText: 'เทศบาลเมืองอุทัยธานี',
  customSubText: '',
  selectedFont: 'Sarabun',
  scaleLogo: 1.0,
  scaleText: 1.0,
  scaleNum: 1.0,
  currentMaterial: 'matte',
  offsets: { logo: { x: 0, y: 0 }, text: { x: 0, y: 0 }, num: { x: 0, y: 0 } },
  COLORS: { green: '#008542', red: '#DC2626', dark: '#1F2937', white: '#FFFFFF' },
})

export const fonts = [
  { value: 'Sarabun',       label: 'Sarabun (ไทย มาตรฐาน)' },
  { value: 'Kanit',         label: 'Kanit (ไทย กลม)' },
  { value: 'Prompt',        label: 'Prompt (ไทย โมเดิร์น)' },
  { value: 'Noto Sans Thai', label: 'Noto Sans Thai' },
  { value: 'Mitr',          label: 'Mitr (ไทย เรียบ)' },
  { value: 'Arial',         label: 'Arial (Latin)' },
  { value: 'Georgia',       label: 'Georgia (Serif)' },
]

export const styles = [
  { id: 1,  name: '1. คลาสสิก',     desc: 'สมมาตร ตัวเลขเน้น' },
  { id: 2,  name: '2. อัตลักษณ์',   desc: 'สีเขียว สะอาดตา' },
  { id: 3,  name: '3. แนวนอน',      desc: 'โลโก้ซ้าย' },
  { id: 4,  name: '4. วงกลม',       desc: 'เน้นหมายเลข' },
  { id: 5,  name: '5. กรอบมน',      desc: 'ตีกรอบหมายเลข' },
  { id: 6,  name: '6. เส้นคั่น',    desc: 'แบ่งสัดส่วน' },
  { id: 7,  name: '7. เลขยักษ์',    desc: 'มองเห็นชัด' },
  { id: 8,  name: '8. เลขบน',       desc: 'หมายเลขนำหน้า' },
  { id: 9,  name: '9. ป้ายทึบ',     desc: 'พื้นหลังหมายเลข' },
  { id: 10, name: '10. ชิดซ้าย',    desc: 'แบบโมเดิร์น' },
  { id: 11, name: '11. ชิดขวา',     desc: 'แหวกแนว' },
  { id: 12, name: '12. ข้อความโค้ง', desc: 'ตราประทับ' },
  { id: 13, name: '13. แนวนอน 2',   desc: 'โลโก้กลาง' },
  { id: 14, name: '14. มินิมอล',    desc: 'โลโก้+เลข' },
  { id: 15, name: '15. ซ้อนทับ',    desc: 'Overlap' },
  { id: 16, name: '16. หนาพิเศษ',   desc: 'เน้นข้อความ' },
  { id: 17, name: '17. ขาวกรอบสี',  desc: 'ตัดกันชัดเจน' },
  { id: 18, name: '18. โลโก้เล็ก',  desc: 'เน้นเลขพิเศษ' },
  { id: 19, name: '19. ตาราง',      desc: 'กรอบบล็อก' },
  { id: 20, name: '20. แผ่นเพลท',   desc: 'จำลองแผ่นรอง' },
]
