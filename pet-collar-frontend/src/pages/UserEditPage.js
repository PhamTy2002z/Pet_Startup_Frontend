import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserEditForm from '../components/UserEditForm';
import FirstTimeScanPopup from '../components/FirstTimeScanPopup';
import EditPopup from '../components/EditPopup';
import { getPetById, getPetAvatarUrl, updatePet, updateAllergicInfo, updatePetOwnerEmail, updatePetDescription, uploadPetAvatar } from '../api/petService';
import { FiMenu, FiSettings, FiHome, FiUser, FiMessageSquare, FiBook, FiMoon, FiInfo, FiPhone, FiCalendar, FiAlertTriangle, FiEdit, FiGlobe, FiShoppingBag } from 'react-icons/fi';
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
    allergicInfo: { 
      substances: [], 
      note: '' 
    },
    avatarUrl: '',
    avatarFileId: null
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('vi'); // Default language is Vietnamese
  const [darkMode, setDarkMode] = useState(false);

  // Labels for both languages
  const labels = {
    vi: {
      profile: 'Hồ sơ',
      home: 'Trang chủ',
      themeStore: 'Theme Store',
      chat: 'Trò chuyện',
      books: 'Sách',
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
      noReExaminations: 'Không có lịch tái khám'
    },
    en: {
      profile: 'Profile',
      home: 'Home',
      themeStore: 'Theme Store',
      chat: 'Chat',
      books: 'Books',
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
      noReExaminations: 'No upcoming re-examinations'
    }
  };

  // Get current language labels
  const t = labels[language];

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setIsLoading(true);
        const pet = await getPetById(id);
        
        // Check if this is a first-time scan (no pet name or owner info)
        const isFirstTime = !pet.info.name && !pet.owner.name && !pet.owner.phone;
        
        setShowPopup(isFirstTime);

        // Process pet data
        const petDataFormatted = {
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
        };
        
        setPetData(petDataFormatted);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching pet data:', error);
        setErrorMessage('Failed to load pet profile. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPetData();
  }, [id, refreshData]);

  // Format reExamination data for Strong side
  const formatReExamSchedule = () => {
    if (!petData.reExaminations || petData.reExaminations.length === 0) {
      return [{ label: t.noSchedules, date: '' }];
    }

    return petData.reExaminations.map(reExam => {
      const date = reExam.date ? new Date(reExam.date) : null;
      const formattedDate = date ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` : '';
      return {
        label: reExam.note || 'Reexamination',
        date: formattedDate
      };
    });
  };

  // Format allergic info for Weak side
  const formatAllergicInfo = () => {
    const { substances, note } = petData.allergicInfo;
    
    if ((!substances || substances.length === 0) && !note) {
      return [{ allergen: t.noAllergies, reaction: '' }];
    }

    if (substances && substances.length > 0) {
      return substances.map(substance => ({
        allergen: substance,
        reaction: note || ''
      }));
    }

    return [{ allergen: 'Unknown allergen', reaction: note || '' }];
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'vi' ? 'en' : 'vi');
  };

  // Report cards based on pet data
  const generateReportCards = () => {
    return [
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
  };

  // Helper functions for report cards
  const formatAge = (birthDate) => {
    if (!birthDate) return 'Age unknown';
    
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (
      today.getMonth() < birthDateObj.getMonth() ||
      (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    
    return `${age} ${age === 1 ? 'year' : 'years'} old`;
  };

  const getNextVaccination = () => {
    if (!petData.vaccinations || petData.vaccinations.length === 0) {
      return t.noVaccinations;
    }

    // Sort by date, get the next one
    const futureVaccinations = petData.vaccinations
      .filter(vac => vac.date && new Date(vac.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureVaccinations.length === 0) {
      return t.noVaccinations;
    }

    const nextVaccination = futureVaccinations[0];
    const date = new Date(nextVaccination.date);
    return `${nextVaccination.name}: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const getNextReExamination = () => {
    if (!petData.reExaminations || petData.reExaminations.length === 0) {
      return t.noReExaminations;
    }

    // Sort by date, get the next one
    const futureReExaminations = petData.reExaminations
      .filter(reExam => reExam.date && new Date(reExam.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureReExaminations.length === 0) {
      return t.noReExaminations;
    }

    const nextReExam = futureReExaminations[0];
    const date = new Date(nextReExam.date);
    return `${nextReExam.note || 'Check-up'}: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const getAllergySummary = () => {
    const { substances } = petData.allergicInfo;

    if (!substances || substances.length === 0) {
      return 'No allergies recorded';
    }

    if (substances.length === 1) {
      return `Allergic to ${substances[0]}`;
    }

    return `Allergic to ${substances.length} substances`;
  };

  const handleFirstTimePopupSubmit = async (formData) => {
    try {
      // Format the data to match the API structure
      const updateData = {
        info: {
          name: formData.petName,
          species: '',
          birthDate: ''
        },
        owner: {
          name: formData.ownerName,
          phone: formData.phoneNumber,
          email: ''
        }
      };

      // Update the pet with basic info
      await updatePet(id, updateData);
      setShowPopup(false);
      setRefreshData(prev => !prev); // Trigger refetch
    } catch (error) {
      console.error('Error updating pet:', error);
      setErrorMessage('Failed to update pet information. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setEditSection('profile');
    setShowEditPopup(true);
  };

  const handleAvatarUpload = async (file) => {
    try {
      if (!file) return;
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      await uploadPetAvatar(id, formData);
      setRefreshData(prev => !prev); // Trigger refetch
    } catch (error) {
      console.error('Error uploading avatar:', error);
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
              ...petData.info,  // Preserve all existing info fields
              name: formData.name,
              species: formData.species,
              birthDate: formData.birthDate,
            },
            owner: petData.owner,  // Preserve owner data
            vaccinations: petData.vaccinations,  // Preserve vaccinations
            reExaminations: petData.reExaminations,  // Preserve reExaminations
            allergicInfo: petData.allergicInfo  // Preserve allergicInfo
          });
          break;
        case 'petInfo':
          await updatePet(id, {
            info: {
              ...petData.info,  // Preserve all existing info fields
              name: formData.name,
              species: formData.species,
              birthDate: formData.birthDate,
              description: formData.description
            },
            owner: petData.owner,  // Preserve owner data
            vaccinations: petData.vaccinations,  // Preserve vaccinations
            reExaminations: petData.reExaminations,  // Preserve reExaminations
            allergicInfo: petData.allergicInfo  // Preserve allergicInfo
          });
          break;
        case 'ownerInfo':
          await updatePet(id, {
            info: petData.info,  // Preserve info data
            owner: {
              ...petData.owner,  // Preserve all existing owner fields
              name: formData.ownerName,
              phone: formData.phone,
              email: formData.email
            },
            vaccinations: petData.vaccinations,  // Preserve vaccinations
            reExaminations: petData.reExaminations,  // Preserve reExaminations
            allergicInfo: petData.allergicInfo  // Preserve allergicInfo
          });
          break;
        case 'vaccinations':
          await updatePet(id, {
            info: petData.info,  // Preserve info data
            owner: petData.owner,  // Preserve owner data
            vaccinations: formData.vaccinations,
            reExaminations: petData.reExaminations,  // Preserve reExaminations
            allergicInfo: petData.allergicInfo  // Preserve allergicInfo
          });
          break;
        case 'reExaminations':
          await updatePet(id, {
            info: petData.info,  // Preserve info data
            owner: petData.owner,  // Preserve owner data
            vaccinations: petData.vaccinations,  // Preserve vaccinations
            reExaminations: formData.reExaminations,
            allergicInfo: petData.allergicInfo  // Preserve allergicInfo
          });
          break;
        case 'allergicInfo':
          // Use the specific API for allergic info
          await updateAllergicInfo(id, {
            substances: formData.substances,
            note: formData.note
          });
          break;
        case 'description':
          // Use the specific API for description
          await updatePetDescription(id, {
            description: formData.description
          });
          break;
        default:
          console.error('Unknown section:', editSection);
          return;
      }
      
      setShowEditPopup(false);
      setRefreshData(prev => !prev); // Trigger refetch
    } catch (error) {
      console.error('Error updating pet data:', error);
      setErrorMessage('Failed to update. Please try again.');
    }
  };

  // Function to render icon based on name
  const renderIcon = (iconName) => {
    switch(iconName) {
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

  // Prepare schedules, allergies and report cards
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
              <img 
                src={petData.avatarUrl} 
                alt="Pet avatar" 
                className="profile-avatar" 
              />
            ) : (
              <div className="profile-avatar avatar-placeholder" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', color: '#aaa', fontSize: '1.2rem', fontWeight: 500}}>
                Photo
              </div>
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
            <button className="language-toggle-btn" onClick={toggleLanguage}>
              <FiGlobe size={14} />
              <span>{t.changeLanguage}</span>
            </button>
          </div>
        </div>

        <div className="tags-section">
          <div className="tags-group">
            <h3 className="tags-title">{t.upcomingSchedules}</h3>
            <div className="tags-container">
              {schedules.map((schedule, index) => (
                <span key={`schedule-${index}`} className="tag strong-tag">
                  {schedule.date && `${schedule.date} `}
                  {schedule.label}
                </span>
              ))}
            </div>
          </div>

          <div className="tags-group">
            <h3 className="tags-title">{t.allergies}</h3>
            <div className="tags-container">
              {allergies.map((allergy, index) => (
                <span key={`allergy-${index}`} className="tag weak-tag">
                  {allergy.allergen}
                  {allergy.reaction && ` (${allergy.reaction})`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h3 className="section-title">{t.petDetails}</h3>
          <div className="cards-grid">
            {reportCards.map((card, index) => (
              <article 
                key={index} 
                className={`card ${card.colorClass}`}
                onClick={() => handleCardClick(card.section)}
              >
                <div className={`card-ribbon ${card.colorClass}`}></div>
                {renderIcon(card.iconName)}
                <h4 className="card-title">{card.title}</h4>
              </article>
            ))}
          </div>
        </div>

        {/* First Time Scan Popup */}
        <FirstTimeScanPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onSubmit={handleFirstTimePopupSubmit}
        />

        {/* Edit Popup for different sections */}
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
          onClick={() => setActiveTab('home')}
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
            setDarkMode(dm => !dm);
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
