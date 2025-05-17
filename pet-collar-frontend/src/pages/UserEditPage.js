// src/pages/UserEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserEditForm from '../components/UserEditForm';
import FirstTimeScanPopup from '../components/FirstTimeScanPopup';
import EditPopup from '../components/EditPopup';
import {
  getPetById,
  getPetAvatarUrl,
  updatePet,
  updateAllergicInfo,
  updatePetDescription,
  uploadPetAvatar
} from '../api/petService';
import {
  FiMenu,
  FiSettings,
  FiHome,
  FiUser,
  FiMoon,
  FiInfo,
  FiPhone,
  FiCalendar,
  FiAlertTriangle,
  FiEdit,
  FiGlobe,
  FiShoppingBag,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import './UserEditPage.css';

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [petData, setPetData] = useState({
    info: {
      name: '',
      species: '',
      description: '',
      birthDate: ''
    },
    owner: {
      name: '',
      phone: '',
      email: ''
    },
    vaccinations: [],
    reExaminations: [],
    allergicInfo: { substances: [], note: '' },
    avatarUrl: '',
    avatarFileId: null
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('vi');
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Default');
  const [previewTheme, setPreviewTheme] = useState(null);

  const availableThemes = [
    { id: 1, name: 'Default', colors: ['#5b5b9f', '#e2e8f0', '#fff'] },
    { id: 2, name: 'Pastel Paws', colors: ['#FFCAE9', '#B5EAEA', '#FFDCDC'] },
    { id: 3, name: 'Forest Friends', colors: ['#C1F4C5', '#6ECEDA', '#FFF5BA'] },
    { id: 4, name: 'Cosmic Cats', colors: ['#D4A5FF', '#FFB2E6', '#9381FF'] }
  ];

  const applyTheme = (themeName) => {
    setCurrentTheme(themeName);
    setShowThemeDropdown(false);
    const selected = availableThemes.find(t => t.name === themeName) || availableThemes[0];
    const root = document.documentElement;
    switch (selected.name) {
      case 'Pastel Paws':
        root.style.setProperty('--color-primary', '#FFCAE9');
        root.style.setProperty('--color-nav-active', '#FFCAE9');
        root.style.setProperty('--color-bg-alt', '#FFF5F9');
        root.style.setProperty('--color-tag-strong-bg', '#FFE0F5');
        root.style.setProperty('--color-tag-strong-text', '#D16BB0');
        break;
      case 'Forest Friends':
        root.style.setProperty('--color-primary', '#6ECEDA');
        root.style.setProperty('--color-nav-active', '#6ECEDA');
        root.style.setProperty('--color-bg-alt', '#F0FBF0');
        root.style.setProperty('--color-tag-strong-bg', '#E0F5E0');
        root.style.setProperty('--color-tag-strong-text', '#4A7B6B');
        break;
      case 'Cosmic Cats':
        root.style.setProperty('--color-primary', '#9381FF');
        root.style.setProperty('--color-nav-active', '#9381FF');
        root.style.setProperty('--color-bg-alt', '#F5F0FF');
        root.style.setProperty('--color-tag-strong-bg', '#E8E0FF');
        root.style.setProperty('--color-tag-strong-text', '#6250B5');
        break;
      default:
        root.style.setProperty('--color-primary', '#5b5b9f');
        root.style.setProperty('--color-nav-active', '#5b5b9f');
        root.style.setProperty('--color-bg-alt', '#F5F9F9');
        root.style.setProperty('--color-tag-strong-bg', '#e8f4ff');
        root.style.setProperty('--color-tag-strong-text', '#2e7de9');
        break;
    }
  };

  const previewThemeOnHover = (themeName) => {
    if (!themeName) {
      setPreviewTheme(null);
      applyTheme(currentTheme);
      return;
    }
    setPreviewTheme(themeName);
    applyTheme(themeName);
  };

  const labels = {
    vi: {
      profile: 'Hồ sơ',
      home: 'Trang chủ',
      themeStore: 'Theme Store',
      night: 'Ban đêm',
      upcomingSchedules: 'Lịch hẹn sắp tới:',
      allergies: 'Dị ứng:',
      petDetails: 'Chi tiết thú cưng:',
      changeLanguage: 'English',
      noSchedules: 'Không có lịch hẹn',
      noAllergies: 'Không có thông tin dị ứng',
      loading: 'Đang tải...',
      petInformation: 'Thông tin thú cưng',
      ownerInformation: 'Thông tin chủ nuôi',
      vaccinationSchedule: 'Lịch tiêm chủng',
      reExaminationSchedule: 'Lịch tái khám',
      allergicInformation: 'Thông tin dị ứng',
      noVaccinations: 'Không có lịch tiêm chủng',
      noReExaminations: 'Không có lịch tái khám',
      theme: 'Chủ đề:',
      applyTheme: 'Áp dụng'
    },
    en: {
      profile: 'Profile',
      home: 'Home',
      themeStore: 'Theme Store',
      night: 'Night',
      upcomingSchedules: 'Upcoming Schedules:',
      allergies: 'Allergies:',
      petDetails: 'Pet Details:',
      changeLanguage: 'Tiếng Việt',
      noSchedules: 'No scheduled appointments',
      noAllergies: 'No allergies recorded',
      loading: 'Loading...',
      petInformation: 'Pet Information',
      ownerInformation: 'Owner Information',
      vaccinationSchedule: 'Vaccination Schedule',
      reExaminationSchedule: 'Re-examination Schedule',
      allergicInformation: 'Allergic Information',
      noVaccinations: 'No upcoming vaccinations',
      noReExaminations: 'No upcoming re-examinations',
      theme: 'Theme:',
      applyTheme: 'Apply'
    }
  };

  const t = labels[language];

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setIsLoading(true);
        const pet = await getPetById(id);
        
        // Check if this is a first-time scan (no basic information set)
        const isFirstTimeScan = !pet.info.name && !pet.owner.name && !pet.owner.phone;
        setShowPopup(isFirstTimeScan);
        
        setPetData({
          info: {
            name: pet.info.name || 'Unnamed Pet',
            species: pet.info.species || 'Unknown Species',
            description: pet.info.description || '',
            birthDate: pet.info.birthDate || ''
          },
          owner: {
            name: pet.owner.name || '',
            phone: pet.owner.phone || '',
            email: pet.owner.email || ''
          },
          vaccinations: pet.vaccinations || [],
          reExaminations: pet.reExaminations || [],
          allergicInfo: pet.allergicInfo || { substances: [], note: '' },
          avatarUrl: pet.avatarFileId ? getPetAvatarUrl(pet.avatarFileId) : '',
          avatarFileId: pet.avatarFileId || null
        });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to load pet profile. Please try again later.');
        setIsLoading(false);
      }
    };
    fetchPetData();
  }, [id, refreshData]);

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
    if (
      today.getMonth() < bd.getMonth() ||
      (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())
    ) age--;
    return `${age} ${age === 1 ? 'year' : 'years'} old`;
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
        owner: { name: data.owner.name, phone: data.owner.phone, email: '' }
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
              <button className="language-toggle-btn" onClick={toggleLanguage}>
                <FiGlobe size={14} />
                <span>{t.changeLanguage}</span>
              </button>

              <div className="theme-dropdown-container">
                <button
                  className="theme-dropdown-btn"
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                >
                  <span>{t.theme} {currentTheme}</span>
                  <FiChevronDown size={14} />
                </button>

                {showThemeDropdown && (
                  <div className="theme-dropdown-menu">
                    {availableThemes.map(th => (
                      <button
                        key={th.id}
                        className={`theme-option ${currentTheme === th.name ? 'active' : ''}`}
                        onClick={() => applyTheme(th.name)}
                        onMouseEnter={() => previewThemeOnHover(th.name)}
                        onMouseLeave={() => previewThemeOnHover(null)}
                      >
                        <div className="theme-colors">
                          {th.colors.map((c, i) => (
                            <span key={i} className="color-dot" style={{ backgroundColor: c }}></span>
                          ))}
                        </div>
                        <span>{th.name}</span>
                        {currentTheme === th.name && <FiCheck size={14} />}
                      </button>
                    ))}
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
