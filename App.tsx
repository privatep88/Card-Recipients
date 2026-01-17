import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, MapPin, Phone, Mail, ChevronLeft, CalendarDays, Download, Upload, 
  CheckCircle, AlertCircle, X, ClipboardList, IdCard, Plus, Trash2, Paperclip, 
  FileImage, FileText, FileSpreadsheet, File, FolderOpen 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ActiveCardRow, RecipientRow } from './types';

// --- Types & Enums ---
enum Tab {
  ACTIVE_CARDS = 'ACTIVE_CARDS',
  RECIPIENTS = 'RECIPIENTS'
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// --- Helper Components ---

// 1. Active Cards Page Component
interface ActiveCardsPageProps {
  rows: ActiveCardRow[];
  setRows: React.Dispatch<React.SetStateAction<ActiveCardRow[]>>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const ActiveCardsPage: React.FC<ActiveCardsPageProps> = ({ rows, setRows, onShowToast }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      const textareas = tableRef.current.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }, [rows]);

  const handleInputChange = (id: number, field: keyof ActiveCardRow, value: string) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleFileChange = (id: number, file: File | null) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, attachment: file } : row));
  };

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        cardType: '',
        cardNumber: '',
        cardCode: '',
        attachment: null,
        notes: ''
      }
    ]);
    onShowToast('تم إضافة صف جديد بنجاح', 'success');
  };

  const handleDeleteRow = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصف؟')) {
      setRows(prev => prev.filter(row => row.id !== id));
      onShowToast('تم حذف الصف بنجاح', 'error');
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <FileImage size={18} className="text-purple-600" />;
    }
    if (type === 'application/pdf' || /\.pdf$/.test(name)) {
      return <FileText size={18} className="text-red-500" />;
    }
    if (/\.(doc|docx)$/.test(name) || type.includes('word')) {
      return <FileText size={18} className="text-blue-600" />;
    }
    if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet size={18} className="text-green-600" />;
    }
    return <File size={18} className="text-gray-600" />;
  };

  const adjustTextareaHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white shadow-lg min-h-[297mm] p-8 flex flex-col relative print:shadow-none print:p-0">
      <div className="bg-[#091526] text-white border border-[#091526] border-b-4 border-b-[#eab308] p-6 text-center mb-1">
        <h1 className="text-xl font-bold mb-6">إدارة الخدمات العامة / قسم إدارة المرافق</h1>
        <h2 className="text-2xl font-bold">بطاقات الزوار الفعالة</h2>
      </div>

      <div className="mb-4 mt-2 flex justify-start no-print print:hidden">
        <button onClick={handleAddRow} className="flex items-center gap-2 bg-[#334155] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-all shadow-sm text-sm font-bold">
          <Plus size={18} />
          <span>إضافة صف جديد</span>
        </button>
      </div>

      <div className="flex-grow">
        <table ref={tableRef} className="w-full border-collapse border border-[#091526] table-fixed">
          <thead>
            <tr className="bg-[#334155] text-white h-12 text-center align-middle">
              <th className="border border-[#091526] w-12 font-bold align-middle text-center">م</th>
              <th className="border border-[#091526] w-1/5 font-bold align-middle text-center">نوع البطاقة</th>
              <th className="border border-[#091526] w-1/5 font-bold align-middle text-center">رقم البطاقة</th>
              <th className="border border-[#091526] w-1/5 font-bold align-middle text-center">كود البطاقة</th>
              <th className="border border-[#091526] w-12 font-bold bg-[#283547] align-middle text-center">
                <div className="flex justify-center items-center h-full w-full">
                  <FolderOpen size={18} className="text-white" />
                </div>
              </th>
              <th className="border border-[#091526] w-1/5 font-bold align-middle text-center">الملاحظات</th>
              <th className="border border-[#091526] w-10 font-bold bg-[#334155] text-white align-middle print:hidden text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`min-h-[48px] ${index % 2 === 0 ? 'bg-white' : 'bg-[#ebf4fa]'} text-center align-middle group`}>
                <td className="border border-[#091526] font-bold text-sm bg-[#334155] text-white align-middle text-center h-full">
                  <div className="flex items-center justify-center h-full min-h-[48px]">{index + 1}</div>
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50 text-black placeholder-gray-400 resize-none overflow-hidden block" value={row.cardType} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardType', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50 text-black placeholder-gray-400 resize-none overflow-hidden block" value={row.cardNumber} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardNumber', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50 text-black placeholder-gray-400 resize-none overflow-hidden block" value={row.cardCode} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardCode', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-0 text-center relative group align-middle h-full">
                  <div className="flex items-center justify-center h-full min-h-[48px] w-full">
                    <input type="file" id={`file-${row.id}`} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" onClick={(e) => (e.currentTarget.value = '')} onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)} />
                    <label htmlFor={`file-${row.id}`} className={`flex items-center justify-center w-full h-full cursor-pointer hover:bg-blue-50 transition-colors py-2 ${!row.attachment ? 'text-gray-400 hover:text-blue-600' : ''}`} title={row.attachment ? row.attachment.name : "إرفاق ملف"}>
                      {row.attachment ? getFileIcon(row.attachment) : <Paperclip size={16} />}
                    </label>
                  </div>
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50 text-black placeholder-gray-400 resize-none overflow-hidden block" value={row.notes} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'notes', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-0 align-middle print:hidden bg-white">
                   <div className="flex items-center justify-center h-full w-full min-h-[48px]">
                     <button onClick={() => handleDeleteRow(row.id)} className="w-full h-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors py-3"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-[#091526] text-white border border-[#091526] p-4 flex justify-between items-center mt-auto px-12 print:mt-auto">
        <p className="font-bold text-sm">ساهر للخدمات الذكية</p>
        <p className="font-bold text-sm font-sans tracking-wide">SAHER FOR SMART SERVICE</p>
      </div>
    </div>
  );
};

// 2. Recipients Page Component
interface RecipientsPageProps {
  rows: RecipientRow[];
  setRows: React.Dispatch<React.SetStateAction<RecipientRow[]>>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const RecipientsPage: React.FC<RecipientsPageProps> = ({ rows, setRows, onShowToast }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      const textareas = tableRef.current.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }, [rows]);

  const handleInputChange = (id: number, field: keyof RecipientRow, value: string) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleFileChange = (id: number, file: File | null) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, attachment: file } : row));
  };

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        recipientName: '',
        department: '',
        receiptDate: '',
        cardType: '',
        cardNumber: '',
        cardCode: '',
        duration: '',
        attachment: null,
        notes: ''
      }
    ]);
    onShowToast('تم إضافة صف جديد بنجاح', 'success');
  };

  const handleDeleteRow = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصف؟')) {
      setRows(prev => prev.filter(row => row.id !== id));
      onShowToast('تم حذف الصف بنجاح', 'error');
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <FileImage size={18} className="text-purple-600" />;
    }
    if (type === 'application/pdf' || /\.pdf$/.test(name)) {
      return <FileText size={18} className="text-red-500" />;
    }
    if (/\.(doc|docx)$/.test(name) || type.includes('word')) {
      return <FileText size={18} className="text-blue-600" />;
    }
    if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet size={18} className="text-green-600" />;
    }
    return <File size={18} className="text-gray-600" />;
  };

  const adjustTextareaHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-[297mm] mx-auto bg-white shadow-lg min-h-[210mm] p-8 flex flex-col relative print:shadow-none print:p-0 landscape-mode">
      <div className="bg-[#091526] text-white border border-[#091526] border-b-4 border-b-[#eab308] p-6 text-center">
        <h1 className="text-xl font-bold mb-6">إدارة الخدمات العامة / قسم إدارة المرافق</h1>
        <h2 className="text-xl font-bold">كشف المستلمين للبطاقات</h2>
      </div>

      <div className="mb-4 mt-2 flex justify-start no-print print:hidden">
        <button onClick={handleAddRow} className="flex items-center gap-2 bg-[#334155] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-all shadow-sm text-sm font-bold">
          <Plus size={18} />
          <span>إضافة صف جديد</span>
        </button>
      </div>

      <div className="flex-grow">
        <table ref={tableRef} className="w-full border-collapse border border-[#091526] table-fixed text-xs">
          <thead>
            <tr className="bg-[#334155] text-white h-12 text-center align-middle">
              <th className="border border-[#091526] w-8 font-bold align-middle text-center">م</th>
              <th className="border border-[#091526] w-32 font-bold align-middle text-center">اسم المستلم</th>
              <th className="border border-[#091526] w-24 font-bold align-middle text-center">الادارة</th>
              <th className="border border-[#091526] w-28 font-bold align-middle text-center">تاريخ الاستلام</th>
              <th className="border border-[#091526] w-24 font-bold align-middle text-center">نوع البطاقة</th>
              <th className="border border-[#091526] w-24 font-bold align-middle text-center">رقم البطاقة</th>
              <th className="border border-[#091526] w-24 font-bold align-middle text-center">كود البطاقة</th>
              <th className="border border-[#091526] w-20 font-bold align-middle text-center">مدة البطاقة</th>
              <th className="border border-[#091526] w-12 font-bold bg-[#283547] align-middle text-center">
                <div className="flex justify-center items-center h-full w-full">
                  <FolderOpen size={18} className="text-white" />
                </div>
              </th>
              <th className="border border-[#091526] w-28 font-bold align-middle text-center">الملاحظات</th>
              <th className="border border-[#091526] w-8 font-bold bg-[#334155] text-white align-middle print:hidden text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`min-h-[40px] ${index % 2 === 0 ? 'bg-white' : 'bg-[#ebf4fa]'} text-center align-middle group`}>
                <td className="border border-[#091526] font-bold bg-[#334155] text-white align-middle text-center h-full">
                  <div className="flex items-center justify-center h-full min-h-[40px]">{index + 1}</div>
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.recipientName} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'recipientName', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.department} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'department', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle h-full">
                  <div className="flex items-center justify-center h-full w-full min-h-[40px]">
                     <input type="date" lang="en" className="w-full h-full bg-transparent text-center focus:outline-none text-black font-inherit cursor-pointer uppercase text-xs sm:text-sm" style={{ fontFamily: 'inherit' }} value={row.receiptDate} onChange={(e) => handleInputChange(row.id, 'receiptDate', e.target.value)} />
                  </div>
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.cardType} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardType', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.cardNumber} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardNumber', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.cardCode} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'cardCode', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.duration} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'duration', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-0 text-center relative group align-middle h-full">
                  <div className="flex items-center justify-center h-full min-h-[40px] w-full">
                    <input type="file" id={`file-${row.id}`} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" onClick={(e) => (e.currentTarget.value = '')} onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)} />
                    <label htmlFor={`file-${row.id}`} className={`flex items-center justify-center w-full h-full cursor-pointer hover:bg-blue-50 transition-colors py-2 ${!row.attachment ? 'text-gray-400 hover:text-blue-600' : ''}`} title={row.attachment ? row.attachment.name : "إرفاق ملف"}>
                      {row.attachment ? getFileIcon(row.attachment) : <Paperclip size={16} />}
                    </label>
                  </div>
                </td>
                <td className="border border-[#091526] p-1 align-middle">
                  <textarea className="w-full bg-transparent text-center align-middle focus:outline-none text-black resize-none overflow-hidden block" value={row.notes} rows={1} onInput={adjustTextareaHeight} onFocus={adjustTextareaHeight} onChange={(e) => handleInputChange(row.id, 'notes', e.target.value)} />
                </td>
                <td className="border border-[#091526] p-0 align-middle print:hidden bg-white">
                   <div className="flex items-center justify-center h-full w-full min-h-[40px]">
                     <button onClick={() => handleDeleteRow(row.id)} className="w-full h-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors py-2"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-[#091526] text-white border border-[#091526] p-4 flex justify-between items-center mt-11 px-12 print:mt-auto">
        <p className="font-bold text-sm">ساهر للخدمات الذكية</p>
        <p className="font-bold text-sm font-sans tracking-wide">SAHER FOR SMART SERVICE</p>
      </div>
    </div>
  );
};


// --- Constants ---

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


// --- Main App Component ---

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.RECIPIENTS);
  const [dateStr, setDateStr] = useState<string>('');
  const [activeRows, setActiveRows] = useState<ActiveCardRow[]>(INITIAL_ACTIVE_ROWS);
  const [recipientRows, setRecipientRows] = useState<RecipientRow[]>(INITIAL_RECIPIENT_ROWS);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('ar-AE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    setDateStr(formatter.format(date));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Excel Export Logic ---
  const handleExport = () => {
    try {
      let dataToExport: any[] = [];
      let fileName = '';
      let wscols: any[] = [];

      if (currentTab === Tab.RECIPIENTS) {
        fileName = 'Recipients_List.xlsx';
        const rowsToExport = recipientRows.filter(row => row.recipientName || row.department || row.cardType || row.cardNumber || row.notes);

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

        wscols = [ { wch: 5 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 50 }];

      } else {
        fileName = 'Active_Cards.xlsx';
        const rowsToExport = activeRows.filter(row => row.cardType || row.cardNumber || row.cardCode || row.notes);

        dataToExport = rowsToExport.map((row, index) => ({
          "م": index + 1,
          "نوع البطاقة": row.cardType,
          "رقم البطاقة": row.cardNumber,
          "كود البطاقة": row.cardCode,
          "اسم المرفق": row.attachment ? row.attachment.name : 'لا يوجد',
          "الملاحظات": row.notes
        }));

        wscols = [ { wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 60 }];
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet['!cols'] = wscols;
      worksheet['!views'] = [{ rightToLeft: true }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
      showToast("تم تصدير الملف بنجاح", 'success');
    } catch (error) {
      console.error("Export Error:", error);
      showToast("حدث خطأ أثناء التصدير", 'error');
    }
  };

  // --- Excel Import Logic ---
  const triggerImport = () => {
    if (fileInputRef.current) fileInputRef.current.click();
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
          attachment: null,
          notes: row["الملاحظات"] || ''
        }));
        
        const finalRows = [...newRows];
        const rowsNeeded = Math.max(0, 15 - finalRows.length);
        for(let i = 0; i < rowsNeeded; i++) finalRows.push({ ...INITIAL_RECIPIENT_ROWS[0], id: timestamp + newRows.length + i });
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
        for(let i = 0; i < rowsNeeded; i++) finalRows.push({ ...INITIAL_ACTIVE_ROWS[0], id: timestamp + newRows.length + i });
        setActiveRows(finalRows);
        showToast('تم استيراد البيانات بنجاح', 'success');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("حدث خطأ أثناء قراءة الملف. تأكد من صحة التنسيق.", 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-bounce-in border transition-all duration-300 ${toast.type === 'success' ? 'bg-[#091526] text-white border-green-500/50' : 'bg-red-900 text-white border-red-500/50'}`}>
          {toast.type === 'success' ? <CheckCircle className="text-green-400" size={24} /> : <AlertCircle className="text-red-400" size={24} />}
          <div className="flex flex-col">
            <span className="font-bold text-sm">{toast.type === 'success' ? 'نجاح' : 'تنبيه'}</span>
            <span className="text-sm text-gray-200">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="mr-4 text-gray-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Dynamic Print Styles */}
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
           <div className="flex flex-row items-center gap-5 md:gap-6 shrink-0 z-10">
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-[1.5rem] flex items-center justify-center shadow-2xl border-t border-white/20 shrink-0">
                  <span className="text-white text-4xl md:text-5xl font-black italic pr-1 font-sans drop-shadow-lg">S</span>
                  <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#d4af37] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[1.5rem]"></div>
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-xl leading-none" style={{fontFamily: 'sans-serif'}}>SAHER</h1>
                <div className="flex items-center gap-2 mt-2 w-full">
                  <span className="text-white/90 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap">FOR SMART SERVICE</span>
                  <div className="flex-grow h-1 bg-[#d4af37] rounded-full shadow-lg opacity-80"></div>
                </div>
              </div>
           </div>
           <div className="flex flex-col items-center text-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-auto z-0 order-3 md:order-2 mt-4 md:mt-0">
                <h2 className="text-[#eab308] text-sm md:text-base font-bold mb-1 tracking-wide bg-blue-900/30 px-4 py-1 rounded-full border border-blue-500/20 backdrop-blur-sm">إدارة الخدمات العامة / قسم إدارة المرافق</h2>
                <p className="text-white text-lg md:text-2xl font-semibold tracking-wide drop-shadow-md mt-2">نظام تسجيل أسماء المستلمين لبطاقات الزوار</p>
           </div>
           <div className="flex items-center justify-end md:justify-start shrink-0 z-10 order-2 md:order-3 w-full md:w-auto">
             <div className="flex items-center gap-3 text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10 mx-auto md:mx-0">
                <CalendarDays size={42} className="text-[#eab308]" />
                <span className="text-sm font-bold">{dateStr}</span>
             </div>
           </div>
        </div>
      </header>

      {/* Navigation Toolbar */}
      <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm p-4 mb-8 no-print sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative grid grid-cols-2 bg-gray-200/80 p-1.5 rounded-xl border border-gray-300/50 shadow-inner w-full md:w-auto min-w-[320px]">
            <div className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#091526] shadow-[0_2px_15px_-3px_rgba(9,21,38,0.4)] border border-[#eab308]/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" style={{ width: 'calc(50% - 6px)', right: currentTab === Tab.RECIPIENTS ? '6px' : 'calc(50%)' }}>
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg"></div>
            </div>
            <button onClick={() => setCurrentTab(Tab.RECIPIENTS)} className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm md:text-base ${currentTab === Tab.RECIPIENTS ? 'text-white scale-105' : 'text-gray-600 hover:text-[#091526]'}`}>
              <ClipboardList size={20} className={`transition-colors duration-300 ${currentTab === Tab.RECIPIENTS ? "text-[#eab308]" : "text-gray-500"}`} />
              <span>كشف المستلمين للبطاقات</span>
            </button>
            <button onClick={() => setCurrentTab(Tab.ACTIVE_CARDS)} className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm md:text-base ${currentTab === Tab.ACTIVE_CARDS ? 'text-white scale-105' : 'text-gray-600 hover:text-[#091526]'}`}>
              <IdCard size={20} className={`transition-colors duration-300 ${currentTab === Tab.ACTIVE_CARDS ? "text-[#eab308]" : "text-gray-500"}`} />
              <span>بطاقات الزوار الفعالة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
            <button onClick={triggerImport} className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-5 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50" title="استيراد من Excel">
              <Upload size={18} /><span>استيراد</span>
            </button>
            <button onClick={handleExport} className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-5 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50" title="تصدير إلى Excel">
              <Download size={18} /><span>تصدير</span>
            </button>
            <button onClick={handlePrint} className="flex flex-row-reverse items-center justify-center gap-2 bg-[#091526] text-white px-6 py-2.5 rounded-lg hover:bg-[#0f2038] transition-all shadow-md hover:shadow-lg active:scale-95 border border-blue-900/50">
              <Printer size={18} /><span>طباعة</span>
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

      {/* Footer */}
      <footer className="bg-[#091526] text-white pt-8 pb-6 mt-auto no-print border-t-4 border-[#eab308]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">عن SAHER</h3>
            <p className="text-gray-300 leading-relaxed text-sm">شركة رائدة في تقديم الحلول والأنظمة الذكية، ملتزمون بالابتكار والجودة لتحقيق أعلى مستويات الكفاءة والخدمات الذكية.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"><ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" /><span>الرئيسية</span></li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"><ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" /><span>خدماتنا</span></li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"><ChevronLeft size={16} className="text-blue-500 group-hover:-translate-x-1 transition-transform" /><span>تواصل معنا</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-yellow-400 pb-2 w-fit">تواصل معنا</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3"><MapPin size={20} className="text-blue-400 mt-1 shrink-0" /><span dir="ltr" className="text-right">Level 3, Baynona Building, Khalif City A</span></li>
              <li className="flex items-center gap-3"><Phone size={20} className="text-blue-400 shrink-0" /><span dir="ltr">+971 4 123 4567</span></li>
              <li className="flex items-center gap-3"><Mail size={20} className="text-blue-400 shrink-0" /><span>Logistic@saher.ae</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-white/10 flex flex-col items-center gap-4 text-xs text-gray-400">
           <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10"><span>اعداد وتصميم /</span><span className="text-blue-300 font-bold">خالد الجفري</span></div>
           <p className="text-center">جميع الحقوق محفوظة لشركة © {new Date().getFullYear()} SAHER FOR SMART SERVICE</p>
        </div>
      </footer>
    </div>
  );
};

export default App;