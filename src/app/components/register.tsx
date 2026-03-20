
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getSupabaseClient, missingSupabaseEnvMessage } from '../lib/supabaseClient';

const wilayas = [
  'Alger',
  'Oran',
  'Ouargla',
  'Constantine',
];
const years = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  '+6th Year',
];
const softwareOptions = [
  'Python',
  'C / C++',
  'MATLAB',
  'Arduino',
  'CAD (SolidWorks / CATIA / Fusion360)',
  'Electronics Prototyping',
  'Simulation Software',
  'Data Analysis Tools',
  'Other',
];
const heardAboutOptions = [
  'Social Media',
  'University / School',
  'Engineering Club',
  'Friends / Colleagues',
  'Previous AEC Participant',
  'Other',
];

const glass =
  'bg-[#10375C]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#EB8317]/30 p-8 md:p-12 relative overflow-hidden';

const inputClass = "w-full p-3.5 rounded-xl bg-[#10375C]/50 border border-[#EB8317]/30 text-white placeholder-white/40 focus:outline-none focus:border-[#EB8317] focus:ring-1 focus:ring-[#EB8317] transition-all duration-300";
const labelClass = "block text-white/80 text-sm font-medium mb-2 tracking-wide";
const buttonClass = "px-8 py-3 rounded-lg font-bold tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95";
const primaryButton = `${buttonClass} bg-gradient-to-r from-[#EB8317] to-[#F3C623] text-white shadow-[0_0_15px_rgba(235,131,23,0.4)] hover:shadow-[0_0_25px_rgba(235,131,23,0.6)]`;
const secondaryButton = `${buttonClass} bg-transparent border-2 border-white/20 text-white hover:border-white/50 hover:bg-white/5`;
const radioLabelClass = "flex items-center space-x-3 cursor-pointer group";
const radioInputClass = "appearance-none w-5 h-5 border-2 border-[#EB8317]/50 rounded-full checked:border-[#EB8317] checked:bg-[#EB8317] transition-all duration-200 relative before:content-[''] before:absolute before:inset-[3px] before:rounded-full checked:before:bg-white";

import { CheckCircle2, ChevronRight, User, Users, MapPin, CheckSquare, Send } from 'lucide-react';

const initialTeam = {
  wilaya: '',
  team_name: '',
  num_members: 3,
  different_universities: '',
  can_attend_physically: '',
  participated_before: '',
  participation_experience: '',
  hands_on_experience: '',
  hands_on_details: '',
  motivation: '',
  heard_about: '',
  anything_to_add: '',
};
type Member = {
  full_name: string;
  email: string;
  phone: string;
  discord: string;
  linkedin: string;
  university: string;
  field_of_study: string;
  year_of_study: string;
  software_tools: string[];
};

const initialMember: Member = {
  full_name: '',
  email: '',
  phone: '',
  discord: '',
  linkedin: '',
  university: '',
  field_of_study: '',
  year_of_study: '',
  software_tools: [],
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidPhone = (value: string) =>
  /^\d{8,15}$/.test(value.trim());

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const Reg = () => {
  const [step, setStep] = useState(0); // 0: wilaya, 1: team, 2: leader, 3: members, 4: final
  const [team, setTeam] = useState({ ...initialTeam });
  const [leader, setLeader] = useState({ ...initialMember });
  const [members, setMembers] = useState([
    { ...initialMember },
    { ...initialMember },
  ]);
  const [loading, setLoading] = useState(false);

  // Handlers for each section
  const handleWilaya = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeam({ ...team, wilaya: e.target.value });
  };
  const handleTeamInfo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeam({ ...team, [name]: value });
    if (name === 'num_members') {
      const n = Number(value);
      setTeam((t) => ({ ...t, num_members: n }));
      setMembers((prev) => {
        const count = n - 1;
        return Array.from({ length: count }, (_, i) => prev[i] || { ...initialMember });
      });
    }
  };
  const handleLeader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setLeader((prev) => {
        let arr = Array.isArray(prev.software_tools) ? prev.software_tools : [];
        if (checked) {
          if (!arr.includes(value)) arr = [...arr, value];
        } else {
          arr = arr.filter((v) => v !== value);
        }
        return { ...prev, software_tools: arr };
      });
    } else {
      setLeader({ ...leader, [name]: value });
    }
  };
  const handleMember = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type, checked } = e.target;
    if (name.startsWith('year_of_study_')) name = 'year_of_study';
    setMembers((prev) => {
      const arr = [...prev];
      if (type === 'checkbox') {
        let tools = Array.isArray(arr[idx].software_tools) ? arr[idx].software_tools : [];
        if (checked) {
          if (!tools.includes(value)) tools = [...tools, value];
        } else {
          tools = tools.filter((v) => v !== value);
        }
        arr[idx] = { ...arr[idx], software_tools: tools };
      } else {
        arr[idx] = { ...arr[idx], [name]: value };
      }
      return arr;
    });
  };

  // Validation helpers
  const validateTeam = () => {
    if (
      !team.wilaya || 
      !team.team_name || 
      !team.num_members || 
      !team.different_universities || 
      !team.can_attend_physically || 
      !team.participated_before || 
      !team.hands_on_experience || 
      !team.motivation
    ) return false;
    return true;
  };
  const validateLeader = () => {
    const requiredFilled = Boolean(
      leader.full_name &&
      leader.email &&
      leader.phone &&
      leader.discord &&
      leader.linkedin &&
      leader.university &&
      leader.field_of_study &&
      leader.year_of_study &&
      leader.software_tools.length > 0
    );

    if (!requiredFilled) {
      toast.error('Please fill all required leader fields.');
      return false;
    }
    if (!isValidEmail(leader.email)) {
      toast.error('Leader email format is invalid.');
      return false;
    }
    if (!isValidPhone(leader.phone)) {
      toast.error('Leader phone must be numeric (8 to 15 digits).');
      return false;
    }
    if (!isValidUrl(leader.linkedin)) {
      toast.error('Leader LinkedIn must be a valid URL (http/https).');
      return false;
    }

    return true;
  };

  const validateMembers = () => {
    for (let i = 0; i < members.length; i += 1) {
      const m = members[i];
      const requiredFilled = Boolean(
        m.full_name &&
        m.email &&
        m.phone &&
        m.discord &&
        m.linkedin &&
        m.university &&
        m.field_of_study &&
        m.year_of_study &&
        m.software_tools.length > 0
      );

      if (!requiredFilled) {
        toast.error(`Please fill all required fields for Member ${i + 1}.`);
        return false;
      }
      if (!isValidEmail(m.email)) {
        toast.error(`Member ${i + 1} email format is invalid.`);
        return false;
      }
      if (!isValidPhone(m.phone)) {
        toast.error(`Member ${i + 1} phone must be numeric (8 to 15 digits).`);
        return false;
      }
      if (!isValidUrl(m.linkedin)) {
        toast.error(`Member ${i + 1} LinkedIn must be a valid URL.`);
        return false;
      }
    }

    return true;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateTeam()) {
      toast.error('Please fill all required team information in Step 1 & 2.');
      setStep(1);
      return;
    }
    if (!validateLeader()) {
      setStep(2);
      return;
    }
    if (!validateMembers()) {
      setStep(3);
      return;
    }
    if (!team.heard_about) {
      toast.error('Please let us know how you heard about us.');
      return;
    }

    const supabase = getSupabaseClient() as any;
    if (!supabase) {
      toast.error(missingSupabaseEnvMessage);
      return;
    }

    setLoading(true);
    toast.loading('Submitting...');
    try {
      // Insert team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          ...team,
          num_members: team.num_members,
          different_universities: team.different_universities === 'Yes',
          can_attend_physically: team.can_attend_physically === 'Yes',
          participated_before: team.participated_before === 'Yes',
          hands_on_experience: team.hands_on_experience === 'Yes',
        })
        .select()
        .single();
      if (teamError || !teamData) throw new Error(teamError?.message || 'Team insert failed');
      const team_id = teamData.id;
      // Insert leader
      const { error: leaderError } = await supabase.from('members').insert({
        ...leader,
        is_leader: true,
        team_id,
      });
      if (leaderError) throw new Error(leaderError.message);
      // Insert members
      for (const m of members) {
        const { error: memberError } = await supabase.from('members').insert({
          ...m,
          is_leader: false,
          team_id,
        });
        if (memberError) throw new Error(memberError.message);
      }
      toast.dismiss();
      toast.success('Registration successful!');
      setStep(0);
      setTeam({ ...initialTeam });
      setLeader({ ...initialMember });
      setMembers([
        { ...initialMember },
        { ...initialMember },
      ]);
    } catch (err) {
      toast.dismiss();
      let msg = 'Submission failed.';
      if (err instanceof Error) msg += ' ' + err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // UI sections
  const steps = [
    { title: 'Location', icon: <MapPin className="w-5 h-5" /> },
    { title: 'Team', icon: <Users className="w-5 h-5" /> },
    { title: 'Leader', icon: <User className="w-5 h-5" /> },
    { title: 'Members', icon: <Users className="w-5 h-5" /> },
    { title: 'Final', icon: <CheckSquare className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen my-32 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <form
        className={`w-full max-w-4xl mx-auto ${glass}`}
        onSubmit={handleSubmit}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EB8317] to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB8317] rounded-full blur-[100px] opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F3C623] rounded-full blur-[120px] opacity-20 -z-10"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#EB8317]/10 border border-[#EB8317]/30 mb-6 drop-shadow-[0_0_15px_rgba(235,131,23,0.3)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#EB8317]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#BAD7E9] to-[#EB8317] text-center tracking-tight mb-4 drop-shadow-sm">
            Event Registration
          </h1>
          <p className="text-[#BAD7E9] text-center max-w-2xl text-lg font-medium leading-relaxed">
            Join the premier engineering competition. Build, innovate, and connect.
          </p>
        </div>

        {/* High-tech Stepper */}
        <div className="relative mb-12 hidden md:block">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 rounded-full hidden sm:block"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#EB8317] to-[#F3C623] -translate-y-1/2 rounded-full transition-all duration-500 ease-out hidden sm:block shadow-[0_0_10px_rgba(235,131,23,0.5)]" 
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex justify-between items-center relative z-10 gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step > i 
                      ? 'bg-[#EB8317] text-white shadow-[0_0_15px_rgba(235,131,23,0.6)] ring-2 ring-[#F3C623]/50 ring-offset-2 ring-offset-[#10375C]' 
                      : step === i 
                        ? 'bg-[#10375C] border-2 border-[#EB8317] text-[#EB8317] shadow-[0_0_20px_rgba(235,131,23,0.4)] scale-110' 
                        : 'bg-white/5 border border-white/10 text-white/40'
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                </div>
                <span className={`mt-3 text-sm font-semibold tracking-wider uppercase ${
                  step >= i ? 'text-[#e0f2fe]' : 'text-white/30'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile progress indicator */}
        <div className="md:hidden flex flex-col items-center mb-8">
           <div className="text-[#EB8317] font-bold text-lg mb-2 flex items-center gap-2">
             {steps[step].icon} {steps[step].title}
           </div>
           <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-[#EB8317] to-[#F3C623] transition-all duration-500"
               style={{ width: `${((step + 1) / steps.length) * 100}%` }}
             ></div>
           </div>
        </div>

        <div className="bg-[#10375C]/40 border border-[#EB8317]/20 rounded-xl p-4 md:p-6 mb-8 shadow-inner backdrop-blur-sm">
          <p className="text-[#94a3b8] text-sm md:text-base leading-relaxed flex items-start gap-3">
             <span className="text-[#EB8317] shrink-0 mt-0.5"><CheckCircle2 className="w-5 h-5"/></span>
             <span><strong className="text-white font-semibold">Important Notes:</strong> Each team must consist of 3 or 4 participants. Members can be from different universities or schools. Only the <strong className="text-[#EB8317] font-semibold">team leader</strong> should fill out this form on behalf of the team.</span>
          </p>
        </div>

        {/* Section 1: Wilaya */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#EB8317]/30 pb-3 flex items-center gap-3">
              <span className="bg-[#EB8317] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(235,131,23,0.5)]">1</span>
              Competition Location
            </h2>
            <div className="mb-8">
              <label className={labelClass}>Choose the wilaya you will participate in</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={team.wilaya}
                  onChange={handleWilaya}
                  required
                >
                  <option value="" disabled className="text-gray-500">Select Wilaya</option>
                  {wilayas.map((w) => (
                    <option key={w} value={w} className="bg-[#10375C] text-white">{w}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#EB8317]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                className={`${primaryButton} flex items-center gap-2`}
                onClick={() => team.wilaya ? setStep(1) : toast.error('Please select a wilaya.')}
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Team Info */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#EB8317]/30 pb-3 flex items-center gap-3">
              <span className="bg-[#EB8317] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(235,131,23,0.5)]">2</span>
              Team Information
            </h2>
            <div className="space-y-6 mb-8">
              <div>
                <label className={labelClass}>Team Name</label>
                <input
                  className={inputClass}
                  placeholder="Enter your team name"
                  name="team_name"
                  value={team.team_name}
                  onChange={handleTeamInfo}
                  required
                />
              </div>
              
              <div className="bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>Number of Team Members</label>
                <div className="flex gap-8 mt-3">
                  {[3, 4].map((n) => (
                    <label key={n} className={radioLabelClass}>
                      <input
                        type="radio"
                        name="num_members"
                        className={radioInputClass}
                        value={n}
                        checked={team.num_members === n}
                        onChange={handleTeamInfo}
                      /> 
                      <span className="text-white font-medium">{n} Members</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>Are your team members from different universities?</label>
                <div className="flex gap-8 mt-3">
                  {['Yes', 'No'].map((v) => (
                    <label key={v} className={radioLabelClass}>
                      <input
                        type="radio"
                        name="different_universities"
                        className={radioInputClass}
                        value={v}
                        checked={team.different_universities === v}
                        onChange={handleTeamInfo}
                      /> 
                      <span className="text-white font-medium">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>If your team is selected, will you be able to attend the competition physically?</label>
                <div className="flex gap-8 mt-3">
                  {['Yes', 'No'].map((v) => (
                    <label key={v} className={radioLabelClass}>
                      <input
                        type="radio"
                        name="can_attend_physically"
                        className={radioInputClass}
                        value={v}
                        checked={team.can_attend_physically === v}
                        onChange={handleTeamInfo}
                      /> 
                      <span className="text-white font-medium">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>Have you participated in engineering competitions before?</label>
                <div className="flex gap-8 mt-3 mb-4">
                  {['Yes', 'No'].map((v) => (
                    <label key={v} className={radioLabelClass}>
                      <input
                        type="radio"
                        name="participated_before"
                        className={radioInputClass}
                        value={v}
                        checked={team.participated_before === v}
                        onChange={handleTeamInfo}
                      /> 
                      <span className="text-white font-medium">{v}</span>
                    </label>
                  ))}
                </div>
                {team.participated_before === 'Yes' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea
                      className={`${inputClass} min-h-[100px] resize-y`}
                      placeholder="Describe your experience (competition name, year, achievements)..."
                      name="participation_experience"
                      value={team.participation_experience}
                      onChange={handleTeamInfo}
                    />
                  </div>
                )}
              </div>

              <div className="bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>Do you have experience with hands-on building or prototyping?</label>
                <div className="flex gap-8 mt-3 mb-4">
                  {['Yes', 'No'].map((v) => (
                    <label key={v} className={radioLabelClass}>
                      <input
                        type="radio"
                        name="hands_on_experience"
                        className={radioInputClass}
                        value={v}
                        checked={team.hands_on_experience === v}
                        onChange={handleTeamInfo}
                      /> 
                      <span className="text-white font-medium">{v}</span>
                    </label>
                  ))}
                </div>
                {team.hands_on_experience === 'Yes' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea
                      className={`${inputClass} min-h-[100px] resize-y`}
                      placeholder="Describe your hands-on experience and projects..."
                      name="hands_on_details"
                      value={team.hands_on_details}
                      onChange={handleTeamInfo}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>What motivated your team to participate in AEC?</label>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y focus:ring-2`}
                  placeholder="Share your team's drive and passion for engineering..."
                  name="motivation"
                  value={team.motivation}
                  onChange={handleTeamInfo}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setStep(0)}
              >Back</button>
              <button
                type="button"
                className={`${primaryButton} flex items-center gap-2`}
                onClick={() => validateTeam() ? setStep(2) : toast.error('Please fill all required fields.')}
              >Continue <ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* Section 3: Team Leader */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#EB8317]/30 pb-3 flex items-center gap-3">
              <span className="bg-[#EB8317] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(235,131,23,0.5)]">3</span>
              Team Leader Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={labelClass}>Full Name</label>
                <input className={inputClass} placeholder="John Doe" name="full_name" value={leader.full_name} onChange={handleLeader} required />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input className={inputClass} placeholder="john@example.com" type="email" name="email" value={leader.email} onChange={handleLeader} required />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input className={inputClass} placeholder="+1234567890" type="tel" name="phone" value={leader.phone} onChange={handleLeader} required />
              </div>
              <div>
                <label className={labelClass}>Discord Username</label>
                <input className={inputClass} placeholder="username#1234" name="discord" value={leader.discord} onChange={handleLeader} required />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>LinkedIn Profile Link</label>
                <input className={inputClass} placeholder="https://linkedin.com/in/username" type="url" name="linkedin" value={leader.linkedin} onChange={handleLeader} required />
              </div>
              
              <div className="md:col-span-2 mt-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#EB8317]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                  Academic Details
                </h3>
              </div>
              
              <div>
                <label className={labelClass}>University / School</label>
                <input className={inputClass} placeholder="Enter your institution" name="university" value={leader.university} onChange={handleLeader} required />
              </div>
              <div>
                <label className={labelClass}>Field of Study / Speciality</label>
                <input className={inputClass} placeholder="e.g. Computer Science, Mechanical Eng." name="field_of_study" value={leader.field_of_study} onChange={handleLeader} required />
              </div>
              
              <div className="md:col-span-2 bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>Year of Study</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  {years.map((y) => (
                    <label key={y} className={radioLabelClass}>
                      <input type="radio" name="year_of_study" className={radioInputClass} value={y} checked={leader.year_of_study === y} onChange={handleLeader} /> 
                      <span className="text-white text-sm">{y}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2 bg-[#10375C]/30 p-5 rounded-xl border border-white/5">
                <label className={labelClass}>What software or tools are you comfortable using?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  {softwareOptions.map((s) => (
                    <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="appearance-none w-5 h-5 border-2 border-[#EB8317]/50 rounded bg-transparent checked:bg-[#EB8317] checked:border-[#EB8317] transition-all duration-200" name="software_tools" value={s} checked={leader.software_tools.includes(s)} onChange={handleLeader} />
                        <svg className={`absolute w-3.5 h-3.5 text-white pointer-events-none transition-opacity duration-200 ${leader.software_tools.includes(s) ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-white/10">
              <button type="button" className={secondaryButton} onClick={() => setStep(1)}>Back</button>
              <button type="button" className={`${primaryButton} flex items-center gap-2`} onClick={() => validateLeader() ? setStep(3) : toast.error('Please fill all required leader fields.')}>Continue <ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* Section 4: Team Members */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#EB8317]/30 pb-3 flex items-center gap-3">
              <span className="bg-[#EB8317] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(235,131,23,0.5)]">4</span>
              Team Members Information
            </h2>
            
            <div className="space-y-12 mb-8">
              {members.map((m, idx) => (
                <div key={idx} className="bg-[#10375C]/40 p-6 rounded-2xl border border-white/10 relative shadow-lg">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#EB8317] to-[#F3C623] rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(235,131,23,0.4)] border border-white/20 z-10">
                    M{idx + 1}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-6 ml-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#EB8317]" /> Member {idx + 1}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input className={inputClass} placeholder="Jane Smith" name="full_name" value={m.full_name} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input className={inputClass} placeholder="jane@example.com" type="email" name="email" value={m.email} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input className={inputClass} placeholder="+1234567890" type="tel" name="phone" value={m.phone} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    <div>
                      <label className={labelClass}>Discord Username</label>
                      <input className={inputClass} placeholder="username#1234" name="discord" value={m.discord} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>LinkedIn Profile Link</label>
                      <input className={inputClass} placeholder="https://linkedin.com/in/username" type="url" name="linkedin" value={m.linkedin} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    
                    <div className="md:col-span-2 mt-2 pt-4 border-t border-white/5"></div>
                    
                    <div>
                      <label className={labelClass}>University / School</label>
                      <input className={inputClass} placeholder="Enter institution" name="university" value={m.university} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    <div>
                      <label className={labelClass}>Field of Study / Speciality</label>
                      <input className={inputClass} placeholder="e.g. Electrical Eng." name="field_of_study" value={m.field_of_study} onChange={(e) => handleMember(idx, e)} required />
                    </div>
                    
                    <div className="md:col-span-2 bg-[#10375C]/50 p-4 rounded-xl">
                      <label className={labelClass}>Year of Study</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {years.map((y) => (
                          <label key={y} htmlFor={`year_m${idx}_${y}`} className={radioLabelClass}>
                            <input 
                              id={`year_m${idx}_${y}`}
                              type="radio" 
                              name={`year_of_study_${idx}`} 
                              className={radioInputClass} 
                              value={y} 
                              checked={m.year_of_study === y} 
                              onChange={(e) => handleMember(idx, e)} 
                            /> 
                            <span className="text-white text-sm">{y}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 bg-[#10375C]/50 p-4 rounded-xl">
                      <label className={labelClass}>What software or tools are you comfortable using?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {softwareOptions.map((s) => (
                          <label key={s} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input type="checkbox" className="appearance-none w-5 h-5 border-2 border-[#EB8317]/50 rounded bg-transparent checked:bg-[#EB8317] checked:border-[#EB8317] transition-all duration-200" name="software_tools" value={s} checked={m.software_tools.includes(s)} onChange={(e) => handleMember(idx, e)} />
                              <svg className={`absolute w-3.5 h-3.5 text-white pointer-events-none transition-opacity duration-200 ${m.software_tools.includes(s) ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-white text-sm">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-6 border-t border-white/10">
              <button type="button" className={secondaryButton} onClick={() => setStep(2)}>Back</button>
              <button type="button" className={`${primaryButton} flex items-center gap-2`} onClick={() => validateMembers() ? setStep(4) : toast.error('Please fill all required member fields.')}>Continue <ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* Section 5: Final */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EB8317]/20 border border-[#EB8317]/50 mb-6 relative">
                <CheckSquare className="w-10 h-10 text-[#EB8317]" />
                <div className="absolute inset-0 rounded-full border-2 border-[#EB8317] border-dashed animate-[spin_10s_linear_infinite] opacity-30"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Almost Done!</h2>
              <p className="text-white/60">Final details before submitting your application.</p>
            </div>
            
            <div className="bg-[#10375C]/30 p-6 rounded-xl border border-white/5 mb-8">
              <label className="block text-white font-semibold mb-4 text-lg">How did you hear about AEC?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {heardAboutOptions.map((h) => (
                  <label key={h} className={`
                    flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer
                    ${team.heard_about === h 
                      ? 'bg-[#EB8317]/20 border-[#EB8317] shadow-[0_0_15px_rgba(235,131,23,0.2)]' 
                      : 'bg-[#10375C]/50 border-white/10 hover:border-white/30 hover:bg-[#10375C]/80'}
                  `}>
                    <input type="radio" name="heard_about" className="hidden" value={h} checked={team.heard_about === h} onChange={handleTeamInfo} /> 
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${team.heard_about === h ? 'border-[#EB8317]' : 'border-white/30'}`}>
                      {team.heard_about === h && <div className="w-2.5 h-2.5 bg-[#EB8317] rounded-full"></div>}
                    </div>
                    <span className="text-white font-medium">{h}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-10">
              <label className={labelClass}>Anything to add? (Optional)</label>
              <textarea 
                className={`${inputClass} min-h-[120px] resize-y focus:ring-2`} 
                placeholder="Any additional information, questions, or comments..." 
                name="anything_to_add" 
                value={team.anything_to_add} 
                onChange={handleTeamInfo} 
              />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-white/10">
              <button type="button" className={`${secondaryButton} w-full sm:w-auto text-center`} onClick={() => setStep(3)}>Back to Members</button>
              <button 
                type="submit" 
                className={`
                  w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold tracking-widest text-lg transition-all duration-300 transform
                  ${loading 
                    ? 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed cursor-wait' 
                    : 'bg-gradient-to-r from-[#EB8317] via-[#F0A81D] to-[#F3C623] text-white shadow-[0_0_20px_rgba(235,131,23,0.5)] hover:shadow-[0_0_35px_rgba(235,131,23,0.7)] hover:scale-105 active:scale-95 border border-[#EB8317]/50'}
                `}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> SUBMIT APPLICATION
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Reg;
