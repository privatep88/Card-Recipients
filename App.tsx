import React, { useState, useEffect, useRef } from 'react';
import { ActiveCardsPage } from './components/ActiveCardsPage';
import { RecipientsPage } from './components/RecipientsPage';
import { Printer, MapPin, Phone, Mail, ChevronLeft, CalendarDays, Download, Upload, CheckCircle, AlertCircle, X, ClipboardList, IdCard } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ActiveCardRow, RecipientRow } from './types';

// Enum for Tab Selection
enum Tab {
  ACTIVE_CARDS = 'ACTIVE_CARDS',
  RECIPIENTS = 'RECIPIENTS'
}

// Initial Data Constants
const INITIAL_ACTIVE_ROWS: ActiveCardRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  cardType: '',
  cardNumber: '',
  cardCode: '',
  attachment: null,
  notes: ''
}));

const INITIAL_RECIPIENT_ROWS: RecipientRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  recipientName: '',
  department: '',
  receiptDate: '',
  cardType: '',
  cardNumber: '',
  cardCode: '',
  duration: '',
  attachment: null,
  notes: ''
}));

// Toast Interface
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.RECIPIENTS);
  const [dateStr, setDateStr] = useState<string>('');
  
  // State lifted up
  const [activeRows, setActiveRows] = useState<ActiveCardRow[]>(INITIAL_ACTIVE_ROWS);
  const [recipientRows, setRecipientRows] = useState<RecipientRow[]>(INITIAL_RECIPIENT_ROWS);
  
  // Toast State
  const [toast, setToast] = useState<Toast | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format date: "الجمعة، 14 أكتوبر 2023"
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('ar-AE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setDateStr(formatter.format(date));
  }, []);

  // Toast Handler
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000); // Auto hide after 3 seconds
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Excel Export Logic ---
  const handleExport = () => {
    let dataToExport: any[] = [];
    let fileName = '';
    let wscols: any[] = [];

    try {
      if (currentTab === Tab.RECIPIENTS) {
        fileName = 'Recipients_List.xlsx';
        
        // Filter out completely empty rows to keep Excel clean
        const rowsToExport = recipientRows.filter(row => 
          row.recipientName || row.department || row.cardType || row.cardNumber || row.notes
        );

        dataToExport = rowsToExport.map((row, index) => ({
          "م": index + 1,
          "اسم المستلم": row.recipientName,
          "الادارة": row.department,
          "تاريخ الاستلام": row.receiptDate,
          "نوع البطاقة": row.cardType,
          "رقم البطاقة": row.cardNumber,
          "كود البطاقة": row.cardCode,
          "مدة البطاقة": row.duration,
          "اسم المرفق": row.attachment ? row.attachment.name : 'لا يوجد',
          "الملاحظات": row.notes
        }));

        // Optimized column widths for Recipients
        wscols = [
          { wch: 5 },  // Sequence
          { wch: 35 }, // Name (Wider)
          { wch: 25 }, // Dept
          { wch: 15 }, // Date
          { wch: 15 }, // Type
          { wch: 20 }, // Number
          { wch: 15 }, // Code
          { wch: 15 }, // Duration
          { wch: 20 }, // Attachment
          { wch: 50 }  // Notes (Much wider)
        ];

      } else {
        fileName = 'Active_Cards.xlsx';

        const rowsToExport = activeRows.filter(row => 
          row.cardType || row.cardNumber || row.cardCode || row.notes
        );

        dataToExport = rowsToExport.map((row, index) => ({
          "م": index + 1,
          "نوع البطاقة": row.cardType,
          "رقم البطاقة": row.cardNumber,
          "كود البطاقة": row.cardCode,
          "اسم المرفق": row.attachment ? row.attachment.name : 'لا يوجد',
          "الملاحظات": row.notes
        }));

        // Optimized column widths for Active Cards
        wscols = [
          { wch: 5 },  // Sequence
          { wch: 30 }, // Type
          { wch: 30 }, // Number
          { wch: 25 }, // Code
          { wch: 25 }, // Attachment
          { wch: 60 }  // Notes
        ];
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet['!cols'] = wscols;
      
      // Right-to-Left Direction for Arabic Excel
      worksheet['!views'] = [{ rightToLeft: true }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
      // Write file
      XLSX.writeFile(workbook, fileName);
      showToast("تم تصدير الملف بنجاح", 'success');
    } catch (error) {
      console.error("Export Error:", error);
      showToast("حدث خطأ أثناء التصدير", 'error');
    }
  };

  // --- Excel Import Logic ---
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset to allow re-selecting same file
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (!data || data.length === 0) {
        showToast("الملف فارغ أو لا يحتوي على بيانات صالحة", 'error');
        return;
      }

      const timestamp = Date.now();

      if (currentTab === Tab.RECIPIENTS) {
        const newRows: RecipientRow[] = data.map((row: any, index: number) => ({
          id: timestamp + index, 
          recipientName: row["اسم المستلم"] || '',
          department: row["الادارة"] || '',
          receiptDate: row["تاريخ الاستلام"] || '',
          cardType: row["نوع البطاقة"] || '',
          cardNumber: row["رقم البطاقة"] ? String(row["رقم البطاقة"]) : '',
          cardCode: row["كود البطاقة"] ? String(row["كود البطاقة"]) : '',
          duration: row["مدة البطاقة"] || '',
          attachment: null, // Cannot import file objects back from Excel
          notes: row["الملاحظات"] || ''
        }));
        
        // Ensure at least 15 rows for display consistency
        const finalRows = [...newRows];
        const rowsNeeded = Math.max(0, 15 - finalRows.length);
        for(let i = 0; i < rowsNeeded; i++) {
           finalRows.push({ ...INITIAL_RECIPIENT_ROWS[0], id: timestamp + newRows.length + i });
        }
        setRecipientRows(finalRows);
        showToast('تم استيراد البيانات بنجاح', 'success');
      } else {
        const newRows: ActiveCardRow[] = data.map((row: any, index: number) => ({
          id: timestamp + index,
          cardType: row["نوع البطاقة"] || '',
          cardNumber: row["رقم البطاقة"] ? String(row["رقم البطاقة"]) : '',
          cardCode: row["كود البطاقة"] ? String(row["كود البطاقة"]) : '',
          attachment: null,
          notes: row["الملاحظات"] || ''
        }));
        
        const finalRows = [...newRows];
        const rowsNeeded = Math.max(0, 15 - finalRows.length);
        for(let i = 0; i < rowsNeeded; i++) {
            finalRows.push({ ...INITIAL_ACTIVE_ROWS[0], id: timestamp + newRows.length + i });
        }
        setActiveRows(finalRows);
        showToast('تم استيراد البيانات بنجاح', 'success');
      }
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("حدث خطأ أثناء قراءة الملف. تأكد من صحة التنسيق.", 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-bounce-in border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#091526] text-white border-green-500/50' 
            : 'bg-red-900 text-white border-red-500/50'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="text-green-400" size={24} /> : <AlertCircle className="text-red-400" size={24} />}
          <div className="flex flex-col">
            <span className="font-bold text-sm">{toast.type === 'success' ? 'نجاح' : 'تنبيه'}</span>
            <span className="text-sm text-gray-200">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="mr-4 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Dynamic Print Styles for Page Orientation */}
      {currentTab === Tab.RECIPIENTS && (
        <style>{`
          @media print { 
            @page { size: landscape; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      )}
      {currentTab === Tab.ACTIVE_CARDS && (
        <style>{`
          @media print { 
            @page { size: portrait; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      )}

      {/* Main Page Header */}
      <header className="w-full bg-[#091526] border-b-4 border-[#eab308] no-print relative">
        <div className="max-w-[98%] mx-auto flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-6 relative">
           
           {/* Right Side: SAHER Logo */}
           <div className="flex flex-row items-center gap-5 md:gap-6 shrink-0 z-10">
              {/* Icon */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-[1.5rem] flex items-center justify-center shadow-2xl border-t border-white/20 shrink-0">
                  <span className="text-white text-4xl md:text-5xl font-black italic pr-1 font-sans drop-shadow-lg">S</span>
                  <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#d4af37] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                  {/* Glass Reflection */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[1.5rem]"></div>
              </div>

              {/* Logo Text */}
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-xl leading-none" style={{fontFamily: 'sans-serif'}}>
                  SAHER
                </h1>
                <div className="flex items-center gap-2 mt-2 w-full">
                  <span className="text-white/90 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap">FOR SMART SERVICE</span>
                  <div className="flex-grow h-1 bg-[#d4af37] rounded-full shadow-lg opacity-80"></div>
                </div>
              </div>
           </div>
           
           {/* Center: Page Titles */}
           <div className="flex flex-col items-center text-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-auto z-0 order-3 md:order-2 mt-4 md:mt-0">
                <h2 className="text-[#eab308] text-sm md:text-base font-bold mb-1 tracking-wide bg-blue-900/30 px-4 py-1 rounded-full border border-blue-500/20 backdrop-blur-sm">
                    إدارة الخدمات العامة / قسم إدارة المرافق
                </h2>
                <p className="text-white text-lg md:text-2xl font-semibold tracking-wide drop-shadow-md mt-2">
                    نظام تسجيل أسماء المستلمين لبطاقات الزوار
                </p>
           </div>

           {/* Left Side: Date */}
           <div className="flex items-center justify-end md:justify-start shrink-0 z-10 order-2 md:order-3 w-full md:w-auto">
             <div className="flex items-center gap-3 text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10 mx-auto md:mx-0">
                <CalendarDays size={42} className="text-[#eab308]" />
                <span className="text-sm font-bold">{dateStr}</span>
             </div>
           </div>

        </div>
      </header>

      {/* Navigation Toolbar (Sticky) */}
      <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm p-4 mb-8 no-print sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Animated Tabs Group */}
          <div className="relative grid grid-cols-2 bg-gray-200/80 p-1.5 rounded-xl border border-gray-300/50 shadow-inner w-full md:w-auto min-w-[320px]">
            
            {/* Sliding Background Pill */}
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#091526] shadow-[0_2px_15px_-3px_rgba(9,21,38,0.4)] border border-[#eab308]/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"
              style={{
                width: 'calc(50% - 6px)',
                right: currentTab === Tab.RECIPIENTS ? '6px' : 'calc(50%)',
              }}
            >
               {/* Subtle Shine Effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg"></div>
            </div>

            {/* Recipients Tab */}
            <button
              onClick={() => setCurrentTab(Tab.RECIPIENTS)}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm md:text-base ${
                currentTab === Tab.RECIPIENTS 
                  ? 'text-white scale-105' 
                  : 'text-gray-600 hover:text-[#091526]'
              }`}
            >
              <ClipboardList size={20} className={`transition-colors duration-300 ${currentTab === Tab.RECIPIENTS ? "text-[#eab308]" : "text-gray-500"}`} />
              <span>كشف المستلمين للبطاقات</span>
            </button>

            {/* Active Cards Tab */}
            <button
              onClick={() => setCurrentTab(Tab.ACTIVE_CARDS)}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm md:text-base ${
                currentTab === Tab.ACTIVE_CARDS 
                  ? 'text-white scale-105' 
                  : 'text-gray-600 hover:text-[#091526]'
              }`}
            >
              <IdCard size={20} className={`transition-colors duration-300 ${currentTab === Tab.ACTIVE_CARDS ? "text-[#eab308]" : "text-gray-500"}`} />
              <span>بطاقات الزوار الفعالة</span>
            </button>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                className="hidden" 
                accept=".xlsx, .xls"
            />
            
            {/* Import Button */}
            <button 
              onClick={triggerImport}
              className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-5 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50"
              title="استيراد من Excel"
            >
              <Upload size={18} />
              <span>استيراد</span>
            </button>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-5 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50"
              title="تصدير إلى Excel"
            >
              <Download size={18} />
              <span>تصدير</span>
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-6 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50"
            >
              <Printer size={18} />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full flex justify-center px-4 flex-grow print:px-0 print:w-full">
        {currentTab === Tab.ACTIVE_CARDS ? (
          <ActiveCardsPage rows={activeRows} setRows={setActiveRows} onShowToast={showToast} />
        ) : (
          <div className="overflow-x-auto print:overflow-visible w-full flex justify-center">
             <RecipientsPage rows={recipientRows} setRows={setRecipientRows} onShowToast={showToast} />
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-[#091526] text-white pt-8 pb-6 mt-auto no-print border-t-4 border-[#eab308]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">عن SAHER</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              شركة رائدة في تقديم الحلول والأنظمة الذكية، ملتزمون بالابتكار والجودة لتحقيق أعلى مستويات الكفاءة والخدمات الذكية.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" />
                <span>الرئيسية</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" />
                <span>خدماتنا</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" />
                <span>تواصل معنا</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">تواصل معنا</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-400 mt-1 shrink-0" />
                <span dir="ltr" className="text-right">Level 3, Baynona Building, Khalif City A</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-blue-400 shrink-0" />
                <span dir="ltr">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-blue-400 shrink-0" />
                <span>Logistic@saher.ae</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-white/10 flex flex-col items-center gap-4 text-xs text-gray-400">
           <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span>اعداد وتصميم /</span>
              <span className="text-blue-300 font-bold">خالد الجفري</span>
           </div>
           <p className="text-center">جميع الحقوق محفوظة لشركة © {new Date().getFullYear()} SAHER FOR SMART SERVICE</p>
        </div>
      </footer>
    </div>
  );
};

export default App;