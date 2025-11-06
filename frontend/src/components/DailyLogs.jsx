import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import ELDLogSheet from './ELDLogSheet';

export default function DailyLogs({ logs }) {
  const [selected, setSelected] = useState(0);
  const [exporting, setExporting] = useState(false);
  const currentLog = logs[selected];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const element = document.getElementById('eld-log-sheet');
      if (!element) {
        alert('Log sheet element not found');
        return;
      }

      const canvas = await window.html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ELD-Log-Day${currentLog.day_number}-${currentLog.date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          ELD Daily Logs
        </h2>
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {logs.map((log, idx) => (
          <button 
            key={idx} 
            onClick={() => setSelected(idx)}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap ${
              selected === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
            Day {log.day_number}
          </button>
        ))}
      </div>

      <div id="eld-log-sheet">
        {currentLog ? <ELDLogSheet log={currentLog} /> : <div>No logs yet</div>}
      </div>
    </div>
  );
}