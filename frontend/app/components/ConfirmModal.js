"use client";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  isLoading = false,
  type = 'success', // 'success', 'warning', or 'info'
  showEmailCheckbox = false,
  emailChecked = true,
  onEmailToggle = null
}) {
  if (!isOpen) return null;

  const isWarning = type === 'warning';
  const isInfo = type === 'info';

  const getIcon = () => {
    if (isWarning) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    } else if (isInfo) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const getBgColor = () => {
    if (isWarning) return 'bg-yellow-100';
    if (isInfo) return 'bg-blue-100';
    return 'bg-emerald-100';
  };

  const getButtonColor = () => {
    if (isWarning) return 'bg-yellow-600 hover:bg-yellow-700';
    if (isInfo) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-emerald-600 hover:bg-emerald-700';
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${getBgColor()}`}>
              {getIcon()}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              {title || 'Confirm Action'}
            </h3>
            
            <div className="text-sm text-slate-600 text-center mb-6">
              {typeof message === 'string' && (message.includes('<') || message.includes('>')) ? (
                <div dangerouslySetInnerHTML={{ __html: message }} />
              ) : (
                message
              )}
            </div>

            {/* Email Checkbox - Only show when showEmailCheckbox is true */}
            {showEmailCheckbox && onEmailToggle && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center gap-2 text-sm text-blue-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailChecked}
                    onChange={(e) => onEmailToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                  />
                  <span>Send confirmation email to corresponding author</span>
                </label>
                <p className="text-xs text-blue-600 mt-1 ml-6">
                  An email will be sent to the corresponding author with the acceptance details.
                </p>
              </div>
            )}

            <div className={`flex gap-3 ${showEmailCheckbox ? 'mt-4' : ''}`}>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white ${getButtonColor()}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}