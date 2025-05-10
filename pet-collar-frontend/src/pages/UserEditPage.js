import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserEditForm from '../components/UserEditForm';
import FirstTimeScanPopup from '../components/FirstTimeScanPopup';
import { getPetById } from '../api/petService';
import './UserEditPage.css';

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialFormData, setInitialFormData] = useState(null);

  useEffect(() => {
    const checkPetData = async () => {
      try {
        const pet = await getPetById(id);
        
        // Check if this is a first-time scan (no pet name or owner info)
        const isFirstTime = !pet.info.name && !pet.owner.name && !pet.owner.phone;
        
        setShowPopup(isFirstTime);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking pet data:', error);
        setIsLoading(false);
      }
    };

    checkPetData();
  }, [id]);

  const handlePopupSubmit = (formData) => {
    // Format the data to match the UserEditForm structure
    const formattedData = {
      info: {
        name: formData.petName,
        species: '',
        birthDate: ''
      },
      owner: {
        name: formData.ownerName,
        phone: formData.phoneNumber,
        email: ''
      },
      vaccinations: [],
      reExaminations: [],
      allergicInfo: { substances: [], note: '' }
    };

    setInitialFormData(formattedData);
    setShowPopup(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-edit-page">
      <FirstTimeScanPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSubmit={handlePopupSubmit}
      />
      <div className="edit-wrapper">
        <UserEditForm initialData={initialFormData} />
      </div>
    </div>
  );
};

export default UserEditPage;
