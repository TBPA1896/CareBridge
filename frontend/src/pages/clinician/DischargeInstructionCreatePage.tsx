import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import { instructionApi } from '../../api/instructionApi';
import { User } from '../../types/auth';
import { FileText, Sparkles, Stethoscope, ArrowRight, AlertCircle } from 'lucide-react';

export const DischargeInstructionCreatePage: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [hospitalName, setHospitalName] = useState('CareBridge Multi-Specialty Hospital');
  const [physician, setPhysician] = useState('Dr. Alok Sharma, MD');
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const list = await patientApi.getAllPatients();
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load patients', e);
      }
    };
    loadPatients();
  }, []);

  const handleTemplateClick = (type: 'cardiac' | 'ortho' | 'general') => {
    if (type === 'cardiac') {
      setDiagnosis('Coronary Artery Disease Post-CABG');
      setRawText(
        `Discharge protocol for cardiac recovery:
Prescribe Tab. Aspirin 75mg once daily morning after breakfast for 14 days.
Tab. Metoprolol 25mg twice daily after meals (08:00 and 20:00).
Tab. Atorvastatin 20mg once at night for 30 days.
Clean surgical sternal wound every morning with saline dressing.
Maintain strict low sodium cardiac diet under 2g salt daily.
Avoid heavy physical activity and lifting over 5kg for 4 weeks.
Light walking permitted 15 minutes twice daily.
Follow up in Cardiology OPD with Dr. Sharma in 10 days.`
      );
    } else if (type === 'ortho') {
      setDiagnosis('Status Post Total Knee Replacement (TKR)');
      setRawText(
        `Post-operative knee replacement instructions:
Tab. Paracetamol 500mg twice daily for mild pain for 7 days.
Cap. Cephalexin 500mg thrice daily after meals for 10 days.
Keep knee dressing dry. Clean incision daily morning with sterile gauze.
Engage in gentle range-of-motion leg exercises 10 minutes twice a day.
Strictly avoid climbing stairs or high impact sports.
Follow-up orthopedic visit scheduled in 14 days for staple removal.`
      );
    } else {
      setDiagnosis('Post-Laparoscopic Cholecystectomy');
      setRawText(
        `Discharge instructions post gall-bladder surgery:
Tab. Pantoprazole 40mg once daily morning before food for 10 days.
Tab. Paracetamol 650mg as needed for abdominal soreness.
Keep laparoscopic puncture sites clean and dry.
Low fat, light digestible diet for 2 weeks. Avoid fried foods.
No strenuous exertion or heavy lifting for 2 weeks.
Follow up in surgical clinic in 7 days.`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !rawText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await instructionApi.createInstruction({
        patientId: selectedPatientId,
        hospitalName,
        attendingPhysician: physician,
        dischargeDate,
        diagnosis,
        rawInstructionText: rawText,
      });

      // Redirect to review page for this instruction
      navigate(`/clinician/instructions/${created.id}/review`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create discharge instruction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-navy-950">Enter Discharge Instructions</h2>
        <p className="text-xs text-slate-500">
          Input doctor discharge paperwork. NLP clinical parser will automatically extract draft recovery items.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick clinical templates helper for examination demo */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-brand-900 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Demo Clinical Templates (Click to prefill realistic doctor notes):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleTemplateClick('cardiac')}
            className="px-3 py-1.5 bg-white hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold border border-brand-200 transition shadow-sm"
          >
            Post-CABG Cardiac Recovery
          </button>
          <button
            type="button"
            onClick={() => handleTemplateClick('ortho')}
            className="px-3 py-1.5 bg-white hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold border border-brand-200 transition shadow-sm"
          >
            Post-Knee Replacement (TKR)
          </button>
          <button
            type="button"
            onClick={() => handleTemplateClick('general')}
            className="px-3 py-1.5 bg-white hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold border border-brand-200 transition shadow-sm"
          >
            Laparoscopic Cholecystectomy
          </button>
        </div>
      </div>

      {/* Discharge Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Patient
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Diagnosis
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Post-CABG Surgery x 3"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic</label>
            <input
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician</label>
            <input
              type="text"
              required
              value={physician}
              onChange={(e) => setPhysician(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discharge Date</label>
            <input
              type="date"
              required
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Doctor Discharge Instruction Text
          </label>
          <textarea
            required
            rows={7}
            placeholder="Type or paste doctor instructions including medications (name, dosage, frequency), wound dressing, diet, walking restrictions, and follow-up visit..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? 'Parsing Instructions...' : 'Extract & Review Structured Draft'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
