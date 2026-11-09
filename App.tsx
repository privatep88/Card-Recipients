import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, MapPin, Phone, Mail, ChevronLeft, CalendarDays, Download, Upload, 
  CheckCircle, AlertCircle, X, ClipboardList, IdCard, Plus, Trash2, Paperclip, 
  FileImage, FileText, FileSpreadsheet, File, FolderOpen, Save, LayoutDashboard,
  Users, BarChart3, PieChart, TrendingUp, Activity, Building, Bell, Timer, Trophy,
  User, Building2, CreditCard, Hash, MessageSquare, ChevronDown, Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ActiveCardRow, RecipientRow } from './types';

// --- Types & Enums ---
enum Tab {
  DASHBOARD = 'DASHBOARD',
  ACTIVE_CARDS = 'ACTIVE_CARDS',
  RECIPIENTS = 'RECIPIENTS'
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const DEPARTMENT_SUGGESTIONS = [
  'إدارة الخدمات العامة',
  'قسم إدارة المرافق',
  'إدارة الموارد البشرية',
  'إدارة تقنية المعلومات',
  'الإدارة المالية',
  'إدارة العمليات',
  'إدارة العلاقات العامة',
  'مكتب المدير العام',
  'قسم المشتريات',
  'أخرى'
];

// --- Helper Components ---

// 1. Dashboard Component
interface DashboardProps {
  activeRows: ActiveCardRow[];
  recipientRows: RecipientRow[];
}

const Dashboard: React.FC<DashboardProps> = ({ activeRows, recipientRows }) => {
  // Calculations
  const validRecipients = recipientRows.filter(r => r.recipientName.trim() !== '');
  const validActiveCards = activeRows.filter(r => r.cardNumber.trim() !== '' || r.cardType.trim() !== '');
  
  const totalRecipients = validRecipients.length;
  const totalActiveCards = validActiveCards.length;
  const totalAttachments = [...validRecipients, ...validActiveCards].filter(r => r.attachment !== null).length;
  
  // Department Stats
  const deptCounts: Record<string, number> = {};
  validRecipients.forEach(r => {
    const dept = r.department.trim() || 'غير محدد';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Card Type Stats
  const typeCounts: Record<string, number> = {};
  [...validRecipients, ...validActiveCards].forEach(r => {
    const type = r.cardType.trim() || 'غير محدد';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  // Recent Activity (Last 5 recipients)
  const recentRecipients = [...validRecipients].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Recipients */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-[#b8cce0] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#091526] to-[#1e40af]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">إجمالي المستلمين</p>
              <h3 className="text-3xl font-black text-[#091526] tabular-nums">{totalRecipients}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors shadow-sm">
              <Users className="text-blue-700" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <TrendingUp size={12} className="text-blue-600" />
            <span>يتم تحديث البيانات تلقائياً</span>
          </p>
        </div>

        {/* Card 2: Active Cards */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-[#b8cce0] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-700 to-teal-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">البطاقات الفعالة</p>
              <h3 className="text-3xl font-black text-emerald-800 tabular-nums">{totalActiveCards}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors shadow-sm">
              <IdCard className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <Activity size={12} className="text-emerald-600" />
            <span>بطاقات قيد الاستخدام حالياً</span>
          </p>
        </div>

        {/* Card 3: Attachments */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-[#b8cce0] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#15365c] to-[#eab308]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">المرفقات المؤرشفة</p>
              <h3 className="text-3xl font-black text-[#091526] tabular-nums">{totalAttachments}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors shadow-sm">
              <Paperclip className="text-amber-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <FileText size={12} className="text-amber-600" />
            <span>ملفات وصور محفوظة</span>
          </p>
        </div>

        {/* Card 4: Departments */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-[#b8cce0] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">الإدارات المسجلة</p>
              <h3 className="text-3xl font-black text-[#091526] tabular-nums">{Object.keys(deptCounts).length}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors shadow-sm">
              <Building className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <BarChart3 size={12} className="text-orange-500" />
            <span>تنوع في الجهات المستفيدة</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section - Types */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-[#b8cce0]">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#091526] flex items-center gap-2">
              <PieChart size={20} className="text-[#eab308]" />
              توزيع أنواع البطاقات
            </h3>
          </div>
          <div className="space-y-4">
            {sortedTypes.length > 0 ? sortedTypes.map(([type, count], idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">{type}</span>
                  <span className="font-bold text-gray-900 tabular-nums">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-l from-[#091526] to-[#1e40af] h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(count / maxTypeCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 py-8">لا توجد بيانات كافية للعرض</div>
            )}
          </div>
        </div>

        {/* Top Departments */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-[#b8cce0]">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#091526] flex items-center gap-2">
              <Building size={20} className="text-[#eab308]" />
              أكثر الإدارات طلباً
            </h3>
          </div>
          <div className="space-y-3">
            {sortedDepts.length > 0 ? sortedDepts.map(([dept, count], idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#f4f8fc] p-3 rounded-lg border border-[#d0e0f0]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#091526] text-[#eab308] flex items-center justify-center font-bold text-xs tabular-nums">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{dept}</span>
                </div>
                <span className="bg-[#091526] text-white text-xs px-2.5 py-1 rounded-md font-bold tabular-nums">{count}</span>
              </div>
            )) : (
              <div className="text-center text-gray-400 py-8">لا توجد بيانات</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#b8cce0] overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-[#091526] flex items-center gap-2">
            <Activity size={20} className="text-[#eab308]" />
            أحدث السجلات المضافة (المستلمين)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border-collapse">
            <thead className="bg-[#0f294a] text-white font-bold">
              <tr>
                <th className="py-2.5 px-4 text-right border border-[#8fabc7]">الاسم</th>
                <th className="py-2.5 px-4 text-right border border-[#8fabc7]">الإدارة</th>
                <th className="py-2.5 px-4 text-right border border-[#8fabc7]">نوع البطاقة</th>
                <th className="py-2.5 px-4 text-right border border-[#8fabc7]">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentRecipients.length > 0 ? recentRecipients.map((row, idx) => (
                <tr key={row.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#dce8f5]'} hover:bg-blue-100/60 transition-colors`}>
                  <td className="py-2.5 px-4 font-medium text-gray-900 border border-[#8fabc7]">{row.recipientName}</td>
                  <td className="py-2.5 px-4 text-gray-700 border border-[#8fabc7]">{row.department}</td>
                  <td className="py-2.5 px-4 border border-[#8fabc7]">
                    <span className="font-semibold text-[#091526] text-xs">{row.cardType || 'عام'}</span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600 font-mono text-xs tabular-nums border border-[#8fabc7]">{row.receiptDate || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400 border border-[#8fabc7]">لا توجد سجلات حديثة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// 2. Active Cards Page Component
interface ActiveCardsPageProps {
  rows: ActiveCardRow[];
  setRows: React.Dispatch<React.SetStateAction<ActiveCardRow[]>>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onSave: () => void;
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
    if (file) {
      onShowToast(`تم إرفاق الملف: ${file.name}`, 'success');
    }
  };

  const handleDeleteRow = (id: number) => {
    setRows(prev => prev.filter(row => row.id !== id));
    onShowToast('تم حذف الصف بنجاح', 'error');
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <FileImage size={15} className="text-purple-600" />;
    }
    if (type === 'application/pdf' || /\.pdf$/.test(name)) {
      return <FileText size={15} className="text-red-500" />;
    }
    if (/\.(doc|docx)$/.test(name) || type.includes('word')) {
      return <FileText size={15} className="text-blue-600" />;
    }
    if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet size={15} className="text-green-600" />;
    }
    return <File size={15} className="text-gray-600" />;
  };

  const adjustTextareaHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-white rounded-2xl shadow-md border border-[#b8cce0] p-2.5 flex flex-col relative print:shadow-none print:p-0 print:border-none">
      {/* Section Header Banner matching Reference Image */}
      <div className="relative bg-gradient-to-l from-[#0a274c] via-[#173f6e] to-[#2c5784] text-white rounded-t-xl min-h-[70px] px-6 py-2.5 flex items-center justify-between overflow-hidden border-b-2 border-[#091526]">
        {/* Decorative Left Badge & Gold Stripes Image */}
        <img
          src="./assets/table-header-left.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-auto object-cover pointer-events-none select-none opacity-95"
        />

        {/* Right Side Title & Gold Icon Box */}
        <div className="relative z-10 flex items-center gap-4 mr-auto sm:mr-0">
          <div className="w-12 h-11 rounded-xl border-2 border-[#eab308] bg-[#071a33]/80 flex items-center justify-center shadow-md shrink-0">
            <IdCard size={26} className="text-[#eab308]" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-sm md:text-base font-bold text-gray-100 leading-snug">
              إدارة الخدمات العامة / قسم إدارة المرافق
            </h1>
            <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight">
              بطاقات الزوار الفعالة
            </h2>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-grow overflow-x-auto mt-1">
        <table ref={tableRef} className="w-full border-collapse border border-[#7c9ab8] table-fixed text-xs">
          <thead>
            <tr className="bg-gradient-to-b from-[#173a63] to-[#0c2340] text-white h-9 text-center align-middle">
              <th className="border border-[#7c9ab8] w-11 font-bold align-middle text-center">م</th>
              <th className="border border-[#7c9ab8] w-1/4 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <IdCard size={14} className="text-blue-200 shrink-0" />
                  <span>نوع البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-1/4 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <CreditCard size={14} className="text-blue-200 shrink-0" />
                  <span>رقم البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-1/5 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Hash size={14} className="text-blue-200 shrink-0" />
                  <span>كود البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-24 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Paperclip size={14} className="text-blue-200 shrink-0" />
                  <span>المرفقات</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-200 shrink-0" />
                  <span>الملاحظات</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-12 font-bold align-middle print:hidden text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`h-7 ${index % 2 === 0 ? 'bg-white' : 'bg-[#dce8f5]'} hover:bg-blue-100/50 text-center align-middle transition-colors group`}>
                <td className="border border-[#8fabc7] font-bold text-xs bg-[#0d233d] text-white align-middle text-center tabular-nums">
                  <div className="flex items-center justify-center h-full min-h-[26px]">{index + 1}</div>
                </td>
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold placeholder-gray-400 resize-none overflow-hidden block leading-5"
                    value={row.cardType}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardType', e.target.value)}
                  />
                </td>
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold placeholder-gray-400 resize-none overflow-hidden block leading-5 tabular-nums"
                    value={row.cardNumber}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardNumber', e.target.value)}
                  />
                </td>
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold placeholder-gray-400 resize-none overflow-hidden block leading-5 tabular-nums"
                    value={row.cardCode}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardCode', e.target.value)}
                  />
                </td>
                <td className="border border-[#8fabc7] p-0 text-center relative align-middle h-full">
                  <div className="flex items-center justify-center h-full min-h-[26px] w-full">
                    <input
                      type="file"
                      id={`active-file-${row.id}`}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      onClick={(e) => (e.currentTarget.value = '')}
                      onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor={`active-file-${row.id}`}
                      className={`flex items-center justify-center w-full h-full cursor-pointer hover:bg-blue-100/60 transition-colors py-1 ${!row.attachment ? 'text-[#476788] hover:text-[#091526]' : ''}`}
                      title={row.attachment ? row.attachment.name : "إرفاق ملف"}
                    >
                      {row.attachment ? getFileIcon(row.attachment) : <Paperclip size={14} />}
                    </label>
                  </div>
                </td>
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-medium placeholder-gray-400 resize-none overflow-hidden block leading-5"
                    value={row.notes}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'notes', e.target.value)}
                  />
                </td>
                <td className="border border-[#8fabc7] p-0 align-middle print:hidden">
                  <div className="flex items-center justify-center h-full w-full min-h-[26px]">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="w-full h-full flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors py-1"
                      title="حذف الصف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Recipients Page Component
interface RecipientsPageProps {
  rows: RecipientRow[];
  setRows: React.Dispatch<React.SetStateAction<RecipientRow[]>>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onSave: () => void;
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
    if (file) {
      onShowToast(`تم إرفاق الملف: ${file.name}`, 'success');
    }
  };

  const handleDeleteRow = (id: number) => {
    setRows(prev => prev.filter(row => row.id !== id));
    onShowToast('تم حذف الصف بنجاح', 'error');
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <FileImage size={15} className="text-purple-600" />;
    }
    if (type === 'application/pdf' || /\.pdf$/.test(name)) {
      return <FileText size={15} className="text-red-500" />;
    }
    if (/\.(doc|docx)$/.test(name) || type.includes('word')) {
      return <FileText size={15} className="text-blue-600" />;
    }
    if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet size={15} className="text-green-600" />;
    }
    return <File size={15} className="text-gray-600" />;
  };

  const adjustTextareaHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-white rounded-2xl shadow-md border border-[#b8cce0] p-2.5 flex flex-col relative print:shadow-none print:p-0 print:border-none landscape-mode">
      {/* Section Header Banner matching Reference Image */}
      <div className="relative bg-gradient-to-l from-[#0a274c] via-[#173f6e] to-[#2c5784] text-white rounded-t-xl min-h-[70px] px-6 py-2.5 flex items-center justify-between overflow-hidden border-b-2 border-[#091526]">
        {/* Decorative Left Badge & Gold Stripes Image */}
        <img
          src="./assets/table-header-left.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-auto object-cover pointer-events-none select-none opacity-95"
        />

        {/* Right Side Title & Gold Icon Box */}
        <div className="relative z-10 flex items-center gap-4 mr-auto sm:mr-0">
          <div className="w-12 h-11 rounded-xl border-2 border-[#eab308] bg-[#071a33]/80 flex items-center justify-center shadow-md shrink-0">
            <IdCard size={26} className="text-[#eab308]" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-sm md:text-base font-bold text-gray-100 leading-snug">
              إدارة الخدمات العامة / قسم إدارة المرافق
            </h1>
            <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight">
              كشف بأسماء المستلمين للبطاقات
            </h2>
          </div>
        </div>
      </div>

      {/* Datalist for Department Field */}
      <datalist id="saher-departments-list">
        {DEPARTMENT_SUGGESTIONS.map((dept) => (
          <option key={dept} value={dept} />
        ))}
      </datalist>

      {/* Table Container */}
      <div className="flex-grow overflow-x-auto mt-1">
        <table ref={tableRef} className="w-full border-collapse border border-[#7c9ab8] table-fixed text-xs">
          <thead>
            <tr className="bg-gradient-to-b from-[#173a63] to-[#0c2340] text-white h-9 text-center align-middle">
              <th className="border border-[#7c9ab8] w-11 font-bold align-middle text-center">م</th>
              <th className="border border-[#7c9ab8] w-44 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <User size={14} className="text-blue-200 shrink-0" />
                  <span>اسم المستلم</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-36 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 size={14} className="text-blue-200 shrink-0" />
                  <span>الإدارة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-28 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <CalendarDays size={14} className="text-blue-200 shrink-0" />
                  <span>تاريخ الاستلام</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-24 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <IdCard size={14} className="text-blue-200 shrink-0" />
                  <span>نوع البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-24 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <CreditCard size={14} className="text-blue-200 shrink-0" />
                  <span>رقم البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-24 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Hash size={14} className="text-blue-200 shrink-0" />
                  <span>كود البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-24 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <CalendarDays size={14} className="text-blue-200 shrink-0" />
                  <span>مدة البطاقة</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-20 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1">
                  <Paperclip size={13} className="text-blue-200 shrink-0" />
                  <span>المرفقات</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-28 font-bold align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <MessageSquare size={13} className="text-blue-200 shrink-0" />
                  <span>الملاحظات</span>
                </div>
              </th>
              <th className="border border-[#7c9ab8] w-11 font-bold align-middle print:hidden text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`h-7 ${index % 2 === 0 ? 'bg-white' : 'bg-[#dce8f5]'} hover:bg-blue-100/50 text-center align-middle transition-colors group`}>
                {/* 1. Row Index */}
                <td className="border border-[#8fabc7] font-bold text-xs bg-[#0d233d] text-white align-middle text-center tabular-nums">
                  <div className="flex items-center justify-center h-full min-h-[25px]">{index + 1}</div>
                </td>

                {/* 2. Recipient Name */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold resize-none overflow-hidden block leading-5"
                    value={row.recipientName}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'recipientName', e.target.value)}
                  />
                </td>

                {/* 3. Department (with Reference Placeholder & Chevron) */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle relative">
                  <div className="flex items-center justify-between w-full h-full">
                    <input
                      type="text"
                      list="saher-departments-list"
                      placeholder="قسم / إدارة / أخرى"
                      className="w-full bg-transparent text-center focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold placeholder-[#1e3a5f]/80 text-[11px] leading-5 pr-1 pl-4"
                      value={row.department}
                      onChange={(e) => handleInputChange(row.id, 'department', e.target.value)}
                    />
                    <ChevronDown size={13} className="text-[#3b5978] absolute left-1.5 pointer-events-none print:hidden" />
                  </div>
                </td>

                {/* 4. Receipt Date (with Calendar Icon matching Reference) */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle h-full relative">
                  <div className="flex items-center justify-between h-full w-full min-h-[25px] relative">
                    <input
                      type="date"
                      lang="en"
                      className={`w-full h-full bg-transparent text-center focus:outline-none font-inherit cursor-pointer uppercase text-[11px] tabular-nums ${row.receiptDate ? 'text-[#091526] font-semibold' : 'text-transparent focus:text-[#091526]'}`}
                      style={{ fontFamily: 'inherit' }}
                      value={row.receiptDate}
                      onChange={(e) => handleInputChange(row.id, 'receiptDate', e.target.value)}
                    />
                    {!row.receiptDate && (
                      <CalendarDays size={13} className="text-[#476788] absolute left-2 pointer-events-none print:hidden" />
                    )}
                  </div>
                </td>

                {/* 5. Card Type */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold resize-none overflow-hidden block leading-5"
                    value={row.cardType}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardType', e.target.value)}
                  />
                </td>

                {/* 6. Card Number */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold resize-none overflow-hidden block leading-5 tabular-nums"
                    value={row.cardNumber}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardNumber', e.target.value)}
                  />
                </td>

                {/* 7. Card Code */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold resize-none overflow-hidden block leading-5 tabular-nums"
                    value={row.cardCode}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'cardCode', e.target.value)}
                  />
                </td>

                {/* 8. Duration */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-semibold resize-none overflow-hidden block leading-5"
                    value={row.duration}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'duration', e.target.value)}
                  />
                </td>

                {/* 9. Attachments */}
                <td className="border border-[#8fabc7] p-0 text-center relative align-middle h-full">
                  <div className="flex items-center justify-center h-full min-h-[25px] w-full">
                    <input
                      type="file"
                      id={`file-${row.id}`}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      onClick={(e) => (e.currentTarget.value = '')}
                      onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor={`file-${row.id}`}
                      className={`flex items-center justify-center w-full h-full cursor-pointer hover:bg-blue-100/60 transition-colors py-1 ${!row.attachment ? 'text-[#476788] hover:text-[#091526]' : ''}`}
                      title={row.attachment ? row.attachment.name : "إرفاق ملف"}
                    >
                      {row.attachment ? getFileIcon(row.attachment) : <Paperclip size={14} />}
                    </label>
                  </div>
                </td>

                {/* 10. Notes */}
                <td className="border border-[#8fabc7] px-1.5 py-0.5 align-middle">
                  <textarea
                    className="w-full bg-transparent text-center align-middle focus:outline-none focus:bg-blue-50/70 text-[#091526] font-medium resize-none overflow-hidden block leading-5"
                    value={row.notes}
                    rows={1}
                    onInput={adjustTextareaHeight}
                    onFocus={adjustTextareaHeight}
                    onChange={(e) => handleInputChange(row.id, 'notes', e.target.value)}
                  />
                </td>

                {/* 11. Delete */}
                <td className="border border-[#8fabc7] p-0 align-middle print:hidden">
                  <div className="flex items-center justify-center h-full w-full min-h-[25px]">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="w-full h-full flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors py-1"
                      title="حذف الصف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [enDateStr, setEnDateStr] = useState<string>('');
  const [activeRows, setActiveRows] = useState<ActiveCardRow[]>(INITIAL_ACTIVE_ROWS);
  const [recipientRows, setRecipientRows] = useState<RecipientRow[]>(INITIAL_RECIPIENT_ROWS);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem('saaed-active-cards');
      if (savedActive) {
        const parsedActive = JSON.parse(savedActive);
        const restoredActive = parsedActive.map((row: Omit<ActiveCardRow, 'attachment'>) => ({ ...row, attachment: null }));
        setActiveRows(restoredActive);
      }

      const savedRecipients = localStorage.getItem('saaed-recipient-cards');
      if (savedRecipients) {
        const parsedRecipients = JSON.parse(savedRecipients);
        const restoredRecipients = parsedRecipients.map((row: Omit<RecipientRow, 'attachment'>) => ({ ...row, attachment: null }));
        setRecipientRows(restoredRecipients);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      showToast("فشل تحميل البيانات المحفوظة", "error");
    }
  }, []);

  // Auto-save data on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const autoSaveChanges = () => {
      try {
        const serializableActiveRows = activeRows.map(({ attachment, ...rest }) => rest);
        const serializableRecipientRows = recipientRows.map(({ attachment, ...rest }) => rest);

        localStorage.setItem('saaed-active-cards', JSON.stringify(serializableActiveRows));
        localStorage.setItem('saaed-recipient-cards', JSON.stringify(serializableRecipientRows));
      } catch (error) {
        console.error("Failed to auto-save data to localStorage", error);
        showToast("فشل الحفظ التلقائي", "error");
      }
    };
    
    autoSaveChanges();
  }, [activeRows, recipientRows]);

  useEffect(() => {
    const date = new Date();
    const arFormatter = new Intl.DateTimeFormat('ar-AE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const enFormatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    setDateStr(arFormatter.format(date));
    setEnDateStr(enFormatter.format(date));
  }, []);

  const validRecipientsCount = recipientRows.filter(r => r.recipientName.trim() !== '').length;
  const validActiveCardsCount = activeRows.filter(r => r.cardNumber.trim() !== '' || r.cardType.trim() !== '').length;

  // --- Statistics Bar Calculations ---
  const validRecipients = recipientRows.filter(r => r.recipientName.trim() !== '');
  const latestRecipient = validRecipients.length > 0 
    ? [...validRecipients].sort((a, b) => b.id - a.id)[0] 
    : null;

  const deptCounts: Record<string, number> = {};
  validRecipients.forEach(r => {
    if (r.department && r.department.trim()) {
      deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    }
  });
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];

  const handlePrint = () => {
    window.print();
  };

  // --- Add Row Logic (Toolbar Button) ---
  const handleAddRowGlobal = () => {
    if (currentTab === Tab.ACTIVE_CARDS) {
      setActiveRows(prev => [
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
      showToast('تم إضافة صف جديد بنجاح', 'success');
    } else {
      if (currentTab === Tab.DASHBOARD) {
        setCurrentTab(Tab.RECIPIENTS);
      }
      setRecipientRows(prev => [
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
      showToast('تم إضافة صف جديد بنجاح', 'success');
    }
  };
  
  // --- Manual Save Logic ---
  const handleSave = () => {
    try {
      const serializableActiveRows = activeRows.map(({ attachment, ...rest }) => rest);
      const serializableRecipientRows = recipientRows.map(({ attachment, ...rest }) => rest);

      localStorage.setItem('saaed-active-cards', JSON.stringify(serializableActiveRows));
      localStorage.setItem('saaed-recipient-cards', JSON.stringify(serializableRecipientRows));
      showToast("تم حفظ التغييرات بنجاح", "success");
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      showToast("حدث خطأ أثناء حفظ البيانات", "error");
    }
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

        wscols = [{ wch: 5 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 50 }];

      } else if (currentTab === Tab.ACTIVE_CARDS) {
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

        wscols = [{ wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 60 }];
      } else {
        fileName = 'Dashboard_Summary.xlsx';
        const validRec = recipientRows.filter(r => r.recipientName.trim() !== '');
        const validAct = activeRows.filter(r => r.cardNumber.trim() !== '' || r.cardType.trim() !== '');
        dataToExport = [
          { "الإحصائية": "إجمالي المستلمين", "القيمة": validRec.length },
          { "الإحصائية": "البطاقات الفعالة", "القيمة": validAct.length }
        ];
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
          department: row["الادارة"] || row["الإدارة"] || '',
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
        for (let i = 0; i < rowsNeeded; i++) finalRows.push({ ...INITIAL_RECIPIENT_ROWS[0], id: timestamp + newRows.length + i });
        setRecipientRows(finalRows);
        showToast('تم استيراد البيانات بنجاح', 'success');
      } else if (currentTab === Tab.ACTIVE_CARDS) {
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
        for (let i = 0; i < rowsNeeded; i++) finalRows.push({ ...INITIAL_ACTIVE_ROWS[0], id: timestamp + newRows.length + i });
        setActiveRows(finalRows);
        showToast('تم استيراد البيانات بنجاح', 'success');
      } else {
        showToast('يرجى اختيار تبويب الجداول لاستيراد البيانات', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("حدث خطأ أثناء قراءة الملف. تأكد من صحة التنسيق.", 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 transition-all duration-300 ${toast.type === 'success' ? 'bg-[#091526] text-white border-[#eab308]' : 'bg-red-950 text-white border-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle className="text-[#eab308]" size={24} /> : <AlertCircle className="text-red-400" size={24} />}
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[#eab308]">{toast.type === 'success' ? 'نجاح' : 'تنبيه'}</span>
            <span className="text-sm text-gray-100">{toast.message}</span>
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
      {currentTab === Tab.DASHBOARD && (
        <style>{`
          @media print { 
            @page { size: portrait; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      )}

      {/* 1. HEADER — PIXEL-PRECISE MATCH TO REFERENCE */}
      <header className="w-full bg-gradient-to-b from-[#041328] via-[#092140] to-[#061830] border-b-2 border-[#eab308] no-print relative overflow-hidden shadow-md">
        {/* Decorative Diagonal Gold/Blue Ribbons */}
        <img
          src="./assets/header-ribbon-left.png"
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute left-[17%] top-0 h-full w-auto object-cover pointer-events-none select-none opacity-95"
        />
        <img
          src="./assets/header-ribbon-right.png"
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute right-[20%] top-0 h-full w-auto object-cover pointer-events-none select-none opacity-95"
        />

        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2.5 gap-4 relative z-10 min-h-[86px]">
          {/* Right Side (in RTL): Original SAHER Logo */}
          <div className="flex flex-row items-center gap-3.5 shrink-0 z-10">
            <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#3b76f6] to-[#1d4ed8] rounded-2xl flex items-center justify-center shadow-xl border border-white/20 shrink-0">
              <span className="text-white text-3xl md:text-4xl font-black italic pr-1 font-sans drop-shadow-md">S</span>
              <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 bg-[#eab308] rounded-full shadow-[0_0_8px_rgba(250,204,21,0.9)]"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl"></div>
            </div>
            <div className="flex flex-col items-end text-left" dir="ltr">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider drop-shadow-md leading-none font-sans">SAHER</h1>
              <span className="text-gray-200 text-[9px] md:text-[10px] font-bold tracking-[0.22em] uppercase whitespace-nowrap mt-1 font-sans">
                FOR SMART SERVICE
              </span>
            </div>
          </div>

          {/* Center: Department Pill + Arabic Title + English Subtitle */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="inline-flex items-center justify-center bg-[#081d38]/90 border border-[#eab308]/70 rounded-full px-5 py-0.5 shadow-sm mb-1">
              <h2 className="text-[#facc15] text-xs md:text-sm font-bold tracking-wide">
                إدارة الخدمات العامة / قسم إدارة المرافق
              </h2>
            </div>
            <p className="text-white text-lg md:text-2xl font-extrabold tracking-wide drop-shadow">
              نظام تسجيل أسماء المستلمين لبطاقات الزوار
            </p>
            <p className="text-gray-200 text-xs md:text-sm font-medium tracking-wide font-sans mt-0.5">
              Visitor Card Recipient Registration System
            </p>
          </div>

          {/* Left Side (in RTL): Bilingual Date & Calendar Box */}
          <div className="flex items-center shrink-0 z-10">
            <div className="flex items-center gap-3 bg-[#06172d]/90 px-4 py-2 rounded-xl border border-[#eab308]/50 shadow-inner">
              <CalendarDays size={28} className="text-[#eab308] shrink-0" />
              <div className="flex flex-col text-left" dir="ltr">
                <span className="text-white text-xs md:text-sm font-bold text-right" dir="rtl">{dateStr}</span>
                <span className="text-gray-300 text-[11px] font-medium font-sans">{enDateStr}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO IMAGE — MANDATORY VISUAL MATCH */}
      <section className="w-full bg-[#061830] border-b-2 border-[#eab308]/80 no-print overflow-hidden">
        <div className="max-w-[1448px] mx-auto w-full">
          <img
            src="./assets/hero-reception.png"
            alt="مكتب الاستقبال وإدارة الزوار - SAHER"
            className="w-full h-auto block object-cover select-none"
          />
        </div>
      </section>

      {/* 3. NEWS & KPI STATISTICS BAR BELOW HERO */}
      <section className="w-full bg-gradient-to-b from-[#071c36] to-[#041122] py-2 px-4 border-b border-[#1c3b61] shadow-md no-print">
        <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-[#081f3c] via-[#0c294d] to-[#081f3c] border border-[#2d527c] rounded-xl px-3 py-2 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#23456b] items-center">
            
            {/* Stat 1: Total Recipients */}
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-3">
                <Users size={26} className="text-[#eab308] shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-white font-bold text-xs md:text-sm leading-tight">إجمالي المستلمين</span>
                  <span className="text-gray-300 text-[10px] font-sans leading-tight">Total Recipients</span>
                </div>
              </div>
              <span className="text-[#facc15] font-black text-xl md:text-2xl tabular-nums">{validRecipientsCount}</span>
            </div>

            {/* Stat 2: Active Cards */}
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-3">
                <IdCard size={26} className="text-[#eab308] shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-white font-bold text-xs md:text-sm leading-tight">البطاقات الفعالة</span>
                  <span className="text-gray-300 text-[10px] font-sans leading-tight">Active Cards</span>
                </div>
              </div>
              <span className="text-[#facc15] font-black text-xl md:text-2xl tabular-nums">{validActiveCardsCount}</span>
            </div>

            {/* Stat 3: Last Recipient */}
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-2.5">
                <User size={24} className="text-[#eab308] shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-white font-bold text-xs md:text-sm leading-tight">آخر مستلم</span>
                  <span className="text-gray-300 text-[10px] font-sans leading-tight">Last Recipient</span>
                </div>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[#facc15] font-bold text-xs md:text-sm leading-tight truncate max-w-[110px]">
                  {latestRecipient ? latestRecipient.recipientName : 'لا يوجد'}
                </span>
                <span className="text-gray-300 text-[10px] font-sans leading-tight">
                  {latestRecipient ? (latestRecipient.receiptDate || 'مسجل') : 'Not Available'}
                </span>
              </div>
            </div>

            {/* Stat 4: Most Requested Department */}
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-2.5">
                <Building2 size={24} className="text-[#eab308] shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-white font-bold text-xs md:text-sm leading-tight">الإدارة الأكثر طلباً</span>
                  <span className="text-gray-300 text-[10px] font-sans leading-tight">Most Requested Department</span>
                </div>
              </div>
              <span className="text-[#facc15] font-bold text-xs md:text-sm truncate max-w-[100px]">
                {topDept ? `${topDept[0]} (${topDept[1]})` : '-'}
              </span>
            </div>

            {/* Stat 5: Latest Updates */}
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-2.5">
                <Bell size={24} className="text-[#eab308] shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-white font-bold text-xs md:text-sm leading-tight">آخر المستجدات</span>
                  <span className="text-gray-300 text-[10px] font-sans leading-tight">Latest Updates</span>
                </div>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[#facc15] font-bold text-xs md:text-sm leading-tight">
                  {validRecipientsCount + validActiveCardsCount > 0 ? `${validRecipientsCount + validActiveCardsCount} سجل` : 'لا يوجد'}
                </span>
                <span className="text-gray-300 text-[10px] font-sans leading-tight">
                  {validRecipientsCount + validActiveCardsCount > 0 ? 'Active Records' : 'No Updates'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. NAVIGATION TABS BAR */}
      <div className="w-full bg-[#e6edf5] border-b border-[#c5d3e2] py-2 px-4 no-print">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-start gap-2.5">
          {/* Tab 1: Recipients */}
          <button
            onClick={() => setCurrentTab(Tab.RECIPIENTS)}
            className={`flex items-center justify-center gap-2.5 px-7 py-2 rounded-xl font-bold text-sm md:text-base transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentTab === Tab.RECIPIENTS
                ? 'bg-gradient-to-b from-[#0d2847] to-[#061527] text-white border-2 border-[#eab308] shadow-md'
                : 'bg-gradient-to-b from-[#dbe4ef] to-[#c7d4e4] text-[#091526] border border-[#aebfd4] hover:from-[#e4ecf5] hover:to-[#d1deed]'
            }`}
          >
            <ClipboardList size={19} className={currentTab === Tab.RECIPIENTS ? 'text-[#eab308]' : 'text-[#1e3a5f]'} />
            <span>سجل المستلمين ({validRecipientsCount})</span>
          </button>

          {/* Tab 2: Active Cards */}
          <button
            onClick={() => setCurrentTab(Tab.ACTIVE_CARDS)}
            className={`flex items-center justify-center gap-2.5 px-7 py-2 rounded-xl font-bold text-sm md:text-base transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentTab === Tab.ACTIVE_CARDS
                ? 'bg-gradient-to-b from-[#0d2847] to-[#061527] text-white border-2 border-[#eab308] shadow-md'
                : 'bg-gradient-to-b from-[#dbe4ef] to-[#c7d4e4] text-[#091526] border border-[#aebfd4] hover:from-[#e4ecf5] hover:to-[#d1deed]'
            }`}
          >
            <IdCard size={19} className={currentTab === Tab.ACTIVE_CARDS ? 'text-[#eab308]' : 'text-[#1e3a5f]'} />
            <span>البطاقات الفعالة ({validActiveCardsCount})</span>
          </button>

          {/* Tab 3: Dashboard */}
          <button
            onClick={() => setCurrentTab(Tab.DASHBOARD)}
            className={`flex items-center justify-center gap-2.5 px-7 py-2 rounded-xl font-bold text-sm md:text-base transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentTab === Tab.DASHBOARD
                ? 'bg-gradient-to-b from-[#0d2847] to-[#061527] text-white border-2 border-[#eab308] shadow-md'
                : 'bg-gradient-to-b from-[#233d5a] to-[#152840] text-white border border-[#385473] hover:from-[#2b496b] hover:to-[#1b324e]'
            }`}
          >
            <BarChart3 size={19} className={currentTab === Tab.DASHBOARD ? 'text-[#eab308]' : 'text-blue-200'} />
            <span>لوحة المعلومات ({validRecipientsCount})</span>
          </button>
        </div>
      </div>

      {/* 5. ACTION BUTTONS TOOLBAR ROW */}
      <div className="w-full bg-[#f5f8fb] border-b border-gray-200 py-2 px-4 no-print shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right Action Buttons: Add Row + Save Changes */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAddRowGlobal}
              className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#174680] to-[#0c294d] hover:from-[#1d5496] hover:to-[#103562] text-white px-5 py-2 rounded-xl border border-[#2e619e] shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus size={17} className="text-white" />
              <span>إضافة صف جديد</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#112c4e] to-[#08182b] hover:from-[#183a63] hover:to-[#0c223d] text-[#facc15] px-5 py-2 rounded-xl border-2 border-[#eab308] shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Save size={16} className="text-[#eab308]" />
              <span>حفظ التغييرات</span>
            </button>
          </div>

          {/* Left Action Buttons: Import + Export + Print */}
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
            
            <button
              onClick={triggerImport}
              className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#11263f] to-[#081526] hover:from-[#193556] hover:to-[#0d2038] text-white px-5 py-2 rounded-xl border border-[#2a4768] shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
              title="استيراد من Excel"
            >
              <span>استيراد</span>
              <Upload size={15} className="text-gray-200" />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#11263f] to-[#081526] hover:from-[#193556] hover:to-[#0d2038] text-white px-5 py-2 rounded-xl border border-[#2a4768] shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
              title="تصدير إلى Excel"
            >
              <span>تصدير</span>
              <Download size={15} className="text-gray-200" />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-gradient-to-b from-[#11263f] to-[#081526] hover:from-[#193556] hover:to-[#0d2038] text-white px-5 py-2 rounded-xl border border-[#2a4768] shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <span>طباعة</span>
              <Printer size={15} className="text-gray-200" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. MAIN CONTENT AREA */}
      <main className="w-full flex justify-center px-3 py-2 flex-grow print:px-0 print:py-0 print:w-full">
        {currentTab === Tab.DASHBOARD ? (
          <Dashboard activeRows={activeRows} recipientRows={recipientRows} />
        ) : currentTab === Tab.ACTIVE_CARDS ? (
          <ActiveCardsPage rows={activeRows} setRows={setActiveRows} onShowToast={showToast} onSave={handleSave} />
        ) : (
          <div className="overflow-x-auto print:overflow-visible w-full flex justify-center">
            <RecipientsPage rows={recipientRows} setRows={setRecipientRows} onShowToast={showToast} onSave={handleSave} />
          </div>
        )}
      </main>

      {/* 7. INSTITUTIONAL FOOTER — EXACT VISUAL REFERENCE */}
      <footer className="bg-gradient-to-b from-[#071f3b] to-[#041122] text-white pt-5 pb-3 mt-auto no-print border-t-[3px] border-[#eab308]">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-3">
          {/* Column 1 (Right, 3 cols): About SAHER */}
          <div className="md:col-span-3 text-right">
            <h3 className="text-sm md:text-base font-bold mb-2 text-white border-b-2 border-[#eab308] pb-1 w-fit">
              عن SAHER
            </h3>
            <p className="text-gray-200 leading-relaxed text-xs">
              شركة رائدة في تقديم الحلول والأنظمة الذكية، ملتزمون بالابتكار والجودة لتحقيق أعلى مستويات الكفاءة والخدمات الذكية.
            </p>
          </div>

          {/* Column 2 (2 cols): Quick Links */}
          <div className="md:col-span-2 text-right">
            <h3 className="text-sm md:text-base font-bold mb-2 text-white border-b-2 border-[#eab308] pb-1 w-fit">
              روابط سريعة
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-200">
              <li onClick={() => setCurrentTab(Tab.RECIPIENTS)} className="flex items-center gap-1.5 hover:text-[#eab308] transition-colors cursor-pointer group">
                <ChevronLeft size={14} className="text-[#eab308] group-hover:-translate-x-1 transition-transform" />
                <span>الرئيسية</span>
              </li>
              <li onClick={() => setCurrentTab(Tab.ACTIVE_CARDS)} className="flex items-center gap-1.5 hover:text-[#eab308] transition-colors cursor-pointer group">
                <ChevronLeft size={14} className="text-[#eab308] group-hover:-translate-x-1 transition-transform" />
                <span>خدماتنا</span>
              </li>
              <li onClick={() => setCurrentTab(Tab.DASHBOARD)} className="flex items-center gap-1.5 hover:text-[#eab308] transition-colors cursor-pointer group">
                <ChevronLeft size={14} className="text-[#eab308] group-hover:-translate-x-1 transition-transform" />
                <span>تواصل معنا</span>
              </li>
            </ul>
          </div>

          {/* Column 3 (3 cols): Contact Us */}
          <div className="md:col-span-3 text-right">
            <h3 className="text-sm md:text-base font-bold mb-2 text-white border-b-2 border-[#eab308] pb-1 w-fit">
              تواصل معنا
            </h3>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-center gap-2.5">
                <MapPin size={15} className="text-[#eab308] shrink-0" />
                <span dir="ltr" className="text-right font-sans">Level 3, Baynona Building, Khalif City A</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#eab308] shrink-0" />
                <span dir="ltr" className="font-sans tabular-nums">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#eab308] shrink-0" />
                <span className="font-sans">Logistic@saher.ae</span>
              </li>
            </ul>
          </div>

          {/* Column 4 (Left, 4 cols): UAE Skyline Illustration + SAHER Brand Lockup */}
          <div className="md:col-span-4 flex items-center justify-end gap-4" dir="ltr">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#3b76f6] to-[#1d4ed8] rounded-xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <span className="text-white text-2xl font-black italic pr-0.5 font-sans">S</span>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#eab308] rounded-full"></div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl font-black text-white tracking-wider leading-none font-sans">SAHER</span>
                <span className="text-gray-300 text-[8px] font-bold tracking-[0.2em] uppercase mt-1 font-sans">
                  FOR SMART SERVICE
                </span>
              </div>
            </div>
            <img
              src="./assets/footer-skyline.png"
              alt=""
              aria-hidden="true"
              className="hidden sm:block h-20 w-auto object-contain opacity-95 pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Bottom Bar: Designer Badge & Copyright */}
        <div className="max-w-[1400px] mx-auto px-6 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-300">
          <div className="flex items-center gap-1.5 bg-[#091e38] px-3.5 py-1 rounded-full border border-white/15 shadow-sm">
            <Settings size={13} className="text-[#eab308]" />
            <span>إعداد وتصميم /</span>
            <span className="text-white font-bold">خالد الهاشمي</span>
          </div>
          <p className="text-center font-medium">
            جميع الحقوق محفوظة لشركة © {new Date().getFullYear()} SAHER FOR SMART SERVICE
          </p>
          <div className="hidden sm:block w-36"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
