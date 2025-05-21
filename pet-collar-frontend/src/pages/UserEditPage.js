// src/pages/UserEditPage.js
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FirstTimeScanPopup from '../components/FirstTimeScanPopup';
import EditPopup           from '../components/EditPopup';
import PetThemeRenderer    from '../components/PetThemeRenderer';

import {
  getPetById,
  getPetAvatarUrl,
  updatePet,
  updateAllergicInfo,
  updatePetDescription,
  uploadPetAvatar
} from '../api/petService';

import {
  getPurchasedThemes,
  redeemThemeCode,
  applyTheme as applyPetTheme
} from '../api/themeService';

import {
  FiMenu, FiSettings, FiHome, FiUser, FiMoon,
  FiInfo, FiPhone, FiCalendar, FiAlertTriangle,
  FiEdit, FiGlobe, FiShoppingBag, FiChevronDown,
  FiCheck, FiGift
} from 'react-icons/fi';
import './UserEditPage.css';

/* ─────────────────────────── Redeem Popup ─────────────────────────── */
const RedeemThemePopup = ({
  isOpen, onClose,
  code, setCode,
  onRedeem, result,
  pet, t
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{t.redeemTheme}</h3>

        <input
          className="redeem-input"
          placeholder={t.enterCode}
          value={code}
          onChange={(e)=>setCode(e.target.value)}
        />

        {result && (
          <p className={result.success ? 'redeem-success' : 'redeem-fail'}>
            {result.success ? t.redeemSuccess : t.redeemFailed}
          </p>
        )}

        {/* Xem thử card nếu redeem thành công */}
        {result?.success && (
          <div className="theme-preview">
            <Suspense fallback={null}>
              <PetThemeRenderer
                presetKey={result.theme.presetKey}
                pet={pet}
              />
            </Suspense>
          </div>
        )}

        <div className="modal-actions">
          <button className="primary-btn" onClick={onRedeem}>
            {t.redeem}
          </button>
          <button className="secondary-btn" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};
/* ───────────────────────────────────────────────────────────────────── */

const UserEditPage = () => {
  const { id }  = useParams();
  const navigate = useNavigate();

  /* ────────────── STATE CŨ ────────────── */
  const [showPopup,   setShowPopup]   = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [petData,     setPetData]     = useState({
    info: { name:'', species:'', description:'', birthDate:'' },
    owner:{ name:'', phone:'', email:'' },
    vaccinations:[], reExaminations:[],
    allergicInfo:{ substances:[], note:'' },
    avatarUrl:'', avatarFileId:null
  });

  const [activeTab,   setActiveTab]   = useState('profile');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [errorMessage,setErrorMessage]= useState('');
  const [language,    setLanguage]    = useState('vi');
  const [darkMode,    setDarkMode]    = useState(false);

  /* ────────────── NEW: THEMES ────────────── */
  const [redeemedThemes,   setRedeemedThemes]   = useState([]); // list themes đã redeem
  const [showThemeDropdown,setShowThemeDropdown]= useState(false);
  const [currentTheme,     setCurrentTheme]     = useState('Default');
  const [currentPresetKey, setCurrentPresetKey] = useState(null);

  /* Redeem flow */
  const [showRedeemPopup,  setShowRedeemPopup]  = useState(false);
  const [redeemCode,       setRedeemCode]       = useState('');
  const [redeemResult,     setRedeemResult]     = useState(null);

  /* ─────────────── I18N ─────────────── */
  const labels = {
    vi: {
      profile:'Hồ sơ', home:'Trang chủ', themeStore:'Theme Store', night:'Ban đêm',
      upcomingSchedules:'Lịch hẹn sắp tới:', allergies:'Dị ứng:', petDetails:'Chi tiết thú cưng:',
      changeLanguage:'English', noSchedules:'Không có lịch hẹn', noAllergies:'Không có thông tin dị ứng',
      loading:'Đang tải...', petInformation:'Thông tin thú cưng', ownerInformation:'Thông tin chủ nuôi',
      vaccinationSchedule:'Lịch tiêm chủng', reExaminationSchedule:'Lịch tái khám',
      allergicInformation:'Thông tin dị ứng', noVaccinations:'Không có lịch tiêm chủng',
      noReExaminations:'Không có lịch tái khám',
      theme:'Chủ đề:', redeemTheme:'Đổi Theme', redeem:'Đổi',
      enterCode:'Nhập mã code...', redeemSuccess:'Đổi thành công!', redeemFailed:'Mã không hợp lệ',
      redeemedThemes:'Theme đã đổi'
    },
    en: {
      profile:'Profile', home:'Home', themeStore:'Theme Store', night:'Night',
      upcomingSchedules:'Upcoming Schedules:', allergies:'Allergies:', petDetails:'Pet Details:',
      changeLanguage:'Tiếng Việt', noSchedules:'No scheduled appointments', noAllergies:'No allergies recorded',
      loading:'Loading...', petInformation:'Pet Information', ownerInformation:'Owner Information',
      vaccinationSchedule:'Vaccination Schedule', reExaminationSchedule:'Re-examination Schedule',
      allergicInformation:'Allergic Information', noVaccinations:'No upcoming vaccinations',
      noReExaminations:'No upcoming re-examinations',
      theme:'Theme:', redeemTheme:'Redeem Theme', redeem:'Redeem',
      enterCode:'Enter redeem code...', redeemSuccess:'Redeemed successfully!', redeemFailed:'Invalid code',
      redeemedThemes:'Redeemed Themes'
    }
  };
  const t = labels[language];

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setIsLoading(true);
        const pet = await getPetById(id);

        /* first-time scan */
        const isFirst = !pet.info.name && !pet.owner.name && !pet.owner.phone;
        setShowPopup(isFirst);

        setPetData({
          info: pet.info,
          owner: pet.owner,
          vaccinations: pet.vaccinations||[],
          reExaminations:pet.reExaminations||[],
          allergicInfo: pet.allergicInfo||{ substances:[], note:'' },
          avatarUrl: pet.avatarFileId ? getPetAvatarUrl(pet.avatarFileId) : '',
          avatarFileId: pet.avatarFileId||null
        });

        /* redeemed themes */
        const themes = await getPurchasedThemes(id); // [{id,name,presetKey}]
        setRedeemedThemes(themes);

        /* nếu pet đã áp dụng theme */
        if (pet.activeTheme) {
          setCurrentTheme(pet.activeTheme.name);
          setCurrentPresetKey(pet.activeTheme.presetKey);
        }

        setIsLoading(false);
      } catch(err){
        console.error(err);
        setErrorMessage('Failed to load pet profile.');
        setIsLoading(false);
      }
    };
    fetchPetData();
  }, [id, refreshData]);
  /* ─────────────── HANDLER: REDEEM ─────────────── */
  const handleRedeemTheme = async () => {
    if (!redeemCode.trim()) return;
    try {
      const res = await redeemThemeCode(redeemCode.trim(), id); // { success, theme }
      setRedeemResult(res);
      if (res.success) {
        setRedeemedThemes(await getPurchasedThemes(id));
        setRedeemCode('');
      }
    } catch {
      setRedeemResult({ success:false });
    }
  };

  /* ─────────────── HANDLER: APPLY ─────────────── */
  const handleApplyTheme = async (theme) => {
    try {
      await applyPetTheme(id, theme.id);
      setCurrentTheme(theme.name);
      setCurrentPresetKey(theme.presetKey);
      setShowThemeDropdown(false);
    } catch { /* toast lỗi nếu muốn */ }
  };

  const formatReExamSchedule = () => {
    if (!petData.reExaminations.length) return [{ label: t.noSchedules, date: '' }];
    return petData.reExaminations.map(r => {
      const d = r.date ? new Date(r.date) : null;
      return {
        label: r.note || 'Reexamination',
        date: d ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` : ''
      };
    });
  };

  const formatAllergicInfo = () => {
    const { substances, note } = petData.allergicInfo;
    if (!substances.length && !note) return [{ allergen: t.noAllergies, reaction: '' }];
    if (substances.length) {
      return substances.map(s => ({ allergen: s, reaction: note || '' }));
    }
    return [{ allergen: 'Unknown allergen', reaction: note || '' }];
  };

  const toggleLanguage = () => setLanguage(l => (l === 'vi' ? 'en' : 'vi'));

  const generateReportCards = () => [
    {
      title: t.petInformation,
      description: `${petData.info.species || 'Species unknown'}, ${formatAge(petData.info.birthDate)}`,
      iconName: 'info',
      colorClass: 'primary',
      section: 'petInfo'
    },
    {
      title: t.ownerInformation,
      description: petData.owner.name || 'No owner information',
      iconName: 'phone',
      colorClass: 'accent',
      section: 'ownerInfo'
    },
    {
      title: t.vaccinationSchedule,
      description: getNextVaccination(),
      iconName: 'calendar',
      colorClass: 'warning',
      section: 'vaccinations'
    },
    {
      title: t.reExaminationSchedule,
      description: getNextReExamination(),
      iconName: 'calendar',
      colorClass: 'info',
      section: 'reExaminations'
    },
    {
      title: t.allergicInformation,
      description: getAllergySummary(),
      iconName: 'alert',
      colorClass: 'success',
      section: 'allergicInfo'
    }
  ];

  const formatAge = (birthDate) => {
    if (!birthDate) return 'Age unknown';
    const bd = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    if (today.getMonth()<bd.getMonth() || (today.getMonth()===bd.getMonth() && today.getDate()<bd.getDate()))
      age--;
    return `${age} ${age===1?'year':'years'} old`;
  };

  const getNextVaccination = () => {
    if (!petData.vaccinations.length) return t.noVaccinations;
    const future = petData.vaccinations
      .filter(v => v.date && new Date(v.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!future.length) return t.noVaccinations;
    const next = future[0];
    const d = new Date(next.date);
    return `${next.name}: ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const getNextReExamination = () => {
    if (!petData.reExaminations.length) return t.noReExaminations;
    const future = petData.reExaminations
      .filter(r => r.date && new Date(r.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!future.length) return t.noReExaminations;
    const next = future[0];
    const d = new Date(next.date);
    return `${next.note || 'Check-up'}: ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const getAllergySummary = () => {
    const { substances } = petData.allergicInfo;
    if (!substances.length) return 'No allergies recorded';
    if (substances.length === 1) return `Allergic to ${substances[0]}`;
    return `Allergic to ${substances.length} substances`;
  };

  const handleFirstTimePopupSubmit = async (data) => {
    try {
      await updatePet(id, {
        info: { name: data.info.name, species: '', birthDate: '' },
        owner: { name: data.owner.name, phone: data.owner.phone, email: data.owner.email }
      });
      setShowPopup(false);
      setRefreshData(r => !r);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to update pet information. Please try again.');
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await uploadPetAvatar(id, fd);
      setRefreshData(r => !r);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to upload avatar. Please try again.');
    }
  };

  const handleCardClick = (section) => {
    setEditSection(section);
    setShowEditPopup(true);
  };

  const handlePopupSubmit = async (formData) => {
    try {
      switch (editSection) {
        case 'profile':
          await updatePet(id, {
            info: {
              ...petData.info,
              name: formData.name,
              species: formData.species,
              birthDate: formData.birthDate
            },
            owner: petData.owner,
            vaccinations: petData.vaccinations,
            reExaminations: petData.reExaminations,
            allergicInfo: petData.allergicInfo
          });
          break;
        case 'petInfo':
          await updatePet(id, {
            info: {
              ...petData.info,
              name: formData.name,
              species: formData.species,
              birthDate: formData.birthDate,
              description: formData.description
            },
            owner: petData.owner,
            vaccinations: petData.vaccinations,
            reExaminations: petData.reExaminations,
            allergicInfo: petData.allergicInfo
          });
          break;
        case 'ownerInfo':
          await updatePet(id, {
            info: petData.info,
            owner: {
              ...petData.owner,
              name: formData.ownerName,
              phone: formData.phone,
              email: formData.email
            },
            vaccinations: petData.vaccinations,
            reExaminations: petData.reExaminations,
            allergicInfo: petData.allergicInfo
          });
          break;
        case 'vaccinations':
          await updatePet(id, {
            info: petData.info,
            owner: petData.owner,
            vaccinations: formData.vaccinations,
            reExaminations: petData.reExaminations,
            allergicInfo: petData.allergicInfo
          });
          break;
        case 'reExaminations':
          await updatePet(id, {
            info: petData.info,
            owner: petData.owner,
            vaccinations: petData.vaccinations,
            reExaminations: formData.reExaminations,
            allergicInfo: petData.allergicInfo
          });
          break;
        case 'allergicInfo':
          await updateAllergicInfo(id, {
            substances: formData.substances,
            note: formData.note
          });
          break;
        case 'description':
          await updatePetDescription(id, { description: formData.description });
          break;
        default:
          console.error('Unknown section:', editSection);
          return;
      }
      setShowEditPopup(false);
      setRefreshData(r => !r);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to update. Please try again.');
    }
  };

  const renderIcon = (name) => {
    switch (name) {
      case 'info':
        return <FiInfo className="card-icon" />;
      case 'phone':
        return <FiPhone className="card-icon" />;
      case 'calendar':
        return <FiCalendar className="card-icon" />;
      case 'alert':
        return <FiAlertTriangle className="card-icon" />;
      default:
        return <FiInfo className="card-icon" />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  const schedules = formatReExamSchedule();
  const allergies = formatAllergicInfo();
  const reportCards = generateReportCards();

  return (
    <div className={`profile-page${darkMode ? ' dark' : ''}`}>
      <header className="profile-header">
        <button className="icon-button">
          <FiMenu size={24} />
        </button>
        <h1 className="header-title">{t.profile}</h1>
        <button className="icon-button">
          <FiSettings size={24} />
        </button>
      </header>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      <main className="profile-content">
        <div className="profile-info">
          <div className="avatar-container">
            {petData.avatarUrl ? (
              <img src={petData.avatarUrl} alt="Pet avatar" className="profile-avatar" />
            ) : (
              <div className="profile-avatar avatar-placeholder">Photo</div>
            )}
            <div
              className="avatar-badge"
              onClick={() => document.getElementById('avatar-upload').click()}
            >
              <FiEdit size={16} color="#fff" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleAvatarUpload(e.target.files[0])}
              />
            </div>
          </div>
          <div className="profile-details">
            <h2 className="profile-name">{petData.info.name}</h2>
            <p className="profile-role">{petData.info.species}</p>
            <div className="profile-actions">
            <button className="redeem-btn" onClick={() => setShowRedeemPopup(true)}>
              <FiGift size={14} />
               <span>{t.redeemTheme}</span>
                </button>
              <button className="language-toggle-btn" onClick={toggleLanguage}>
                <FiGlobe size={14} />
                <span>{t.changeLanguage}</span>
              </button>
              {/* THAY TOÀN BỘ KHỐI CŨ BẰNG KHỐI NÀY */}
              <div className="theme-dropdown-container">
                <button
                   className="theme-dropdown-btn"
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                            >
                  <span>{t.theme} {currentTheme}</span>
                 <FiChevronDown size={14} />
                   </button>

  {showThemeDropdown && (
    <div className="theme-dropdown-menu cards-view">
      {redeemedThemes.length ? (
        redeemedThemes.map(th => (
          <button
            key={th.id}
            className={`theme-card ${currentTheme === th.name ? 'active' : ''}`}
            onClick={() => handleApplyTheme(th)}
          >
            <Suspense fallback={<div className="theme-card-img" />}>
              <PetThemeRenderer
                presetKey={th.presetKey}
                pet={{ name: petData.info.name, imageUrl: petData.avatarUrl }}
              />
            </Suspense>
            <span className="theme-card-name">{th.name}</span>
            {currentTheme === th.name && <FiCheck size={14} />}
          </button>
        ))
      ) : (
        <p className="empty-note">{t.redeemedThemes}: 0</p>
      )}
    </div>
  )}
</div>

            </div>
          </div>
        </div>

        <div className="tags-section">
          <div className="tags-group">
            <h3 className="tags-title">{t.upcomingSchedules}</h3>
            <div className="tags-container">
              {schedules.map((s, i) => (
                <span key={i} className="tag strong-tag">
                  {s.date && `${s.date} `}{s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="tags-group">
            <h3 className="tags-title">{t.allergies}</h3>
            <div className="tags-container">
              {allergies.map((a, i) => (
                <span key={i} className="tag weak-tag">
                  {a.allergen}{a.reaction && ` (${a.reaction})`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h3 className="section-title">{t.petDetails}</h3>
          <div className="cards-grid">
            {reportCards.map((c, i) => (
              <article
                key={i}
                className={`card ${c.colorClass}`}
                onClick={() => handleCardClick(c.section)}
              >
                <div className={`card-ribbon ${c.colorClass}`}></div>
                {renderIcon(c.iconName)}
                <h4 className="card-title">{c.title}</h4>
              </article>
            ))}
          </div>
        </div>

        <FirstTimeScanPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onSubmit={handleFirstTimePopupSubmit}
        />

        <EditPopup
          isOpen={showEditPopup}
          section={editSection}
          petData={petData}
          onClose={() => setShowEditPopup(false)}
          onSubmit={handlePopupSubmit}
        />
        <RedeemThemePopup
           isOpen={showRedeemPopup}
            onClose={() => { setShowRedeemPopup(false); setRedeemResult(null); setRedeemCode(''); }}
            code={redeemCode}
            setCode={setRedeemCode}
            onRedeem={handleRedeemTheme}
            result={redeemResult}
            pet={{ name: petData.info.name, imageUrl: petData.avatarUrl }}
             t={t}
             />
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            navigate('/');
          }}
        >
          <FiHome size={22} />
          <span className="nav-label">{t.home}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser size={22} />
          <span className="nav-label">{t.profile}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'themeStore' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('themeStore');
            navigate('/theme-store');
          }}
        >
          <FiShoppingBag size={22} />
          <span className="nav-label">{t.themeStore}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'night' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('night');
            setDarkMode(d => !d);
          }}
        >
          <FiMoon size={22} />
          <span className="nav-label">{t.night}</span>
        </button>
      </nav>
    </div>
  );
};

export default UserEditPage;
