import React from 'react';
import { FileText, Download, ExternalLink, X } from 'lucide-react';
import Modal from '../common/Modal';

const ResumeViewerModal = ({ isOpen, onClose, resume, candidateName }) => {
  if (!resume || !resume.url) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${candidateName || 'Candidate'} — Resume`} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pro-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">{resume.fileName || 'Resume.pdf'}</p>
              {resume.fileSize && (
                <p className="text-[10px] text-slate-500">{(resume.fileSize / 1024).toFixed(0)} KB</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </a>
            <a
              href={resume.url}
              download={resume.fileName || 'Resume.pdf'}
              className="pro-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="w-full h-[65vh] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            src={resume.url}
            title="Resume Preview"
            className="w-full h-full"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ResumeViewerModal;
