"use client"

import React, { useState, useEffect } from "react"
import { supabase } from '../client'; // Import Supabase client
// Import your UI components from their respective paths
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "./ui/Button"
import Input from "./ui/Input"
import { Badge } from "./ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { User, UploadCloud, Star, Shield, Check } from "./ui/Icons";// Import User and UploadCloud icons

// Accept props from App.jsx
export default function ProfileSection({ userId, profileData, onProfileUpdate, dataError, selectedAccountTypeDetails, followedInvestors }) {
  // Internal state for form fields, initialized with profileData from props
  const [editableProfile, setEditableProfile] = useState(profileData);
  const [imageFile, setImageFile] = useState(null); // State to hold the selected image file
  const [imagePreviewUrl, setImagePreviewUrl] = useState(profileData.profilePictureUrl); // State for image preview
  const [uploadingImage, setUploadingImage] = useState(false); // State for image upload loading
  const [profileSavingLocal, setProfileSavingLocal] = useState(false); // Local state for saving UI

  // Update internal state when props.profileData changes (e.g., after a successful save or initial load)
  useEffect(() => {
    setEditableProfile(profileData);
    // IMPORTANT: Update image preview when profileData.profilePictureUrl changes from App.jsx
    setImagePreviewUrl(profileData.profilePictureUrl);
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create a local URL for instant preview
    } else {
      setImageFile(null);
      setImagePreviewUrl(editableProfile.profilePictureUrl); // Revert to saved URL if no file
    }
  };

  const uploadProfilePicture = async () => {
    if (!imageFile || !userId) return null;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      // Use userId as the folder name and file name for uniqueness per user
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-picture') // Your bucket name
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists
        });

      if (error) {
        throw error;
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        return publicUrlData.publicUrl;
      } else {
        throw new Error("Failed to get public URL for uploaded image.");
      }

    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      // You might want to set a dataError state here to display to the user
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileSavingLocal(true); // Start local saving state

    let newProfilePictureUrl = editableProfile.profilePictureUrl; // Start with current URL

    try {
      if (imageFile) {
        // Only upload if a new file has been selected
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          newProfilePictureUrl = uploadedUrl; // Use the newly uploaded URL
        } else {
          // If upload failed, stop local saving and return (error handled by uploadProfilePicture)
          setProfileSavingLocal(false);
          return;
        }
      }

      // Call the prop function to update the profile in App.jsx
      // Pass the updated profile data including the new profilePictureUrl
      await onProfileUpdate({
        ...editableProfile,
        profilePictureUrl: newProfilePictureUrl,
      });

    } catch (error) {
      console.error("Error in handleSubmit:", error.message);
      // dataError will be set by onProfileUpdate in App.jsx
    } finally {
      setProfileSavingLocal(false); // End local saving state
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your personal information and trading preferences.</p>
        </div>
        <Button onClick={handleSubmit} disabled={profileSavingLocal || uploadingImage}>
          {profileSavingLocal || uploadingImage ? (
            <span className="loading loading-spinner"></span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {dataError}</span>
        </div>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="trading">Trading Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile photo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {/* Display current profile picture or placeholder */}
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/e2e8f0/64748b?text=User"; }} // Fallback image
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors text-sm">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {uploadingImage ? "Uploading..." : "Change Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadingImage || profileSavingLocal}
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <Input
                      name="firstName" // Add name attribute
                      value={editableProfile.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <Input
                      name="lastName" // Add name attribute
                      value={editableProfile.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <Input
                    type="email"
                    name="email" // Add name attribute
                    value={editableProfile.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <Input
                    name="phone" // Add name attribute
                    value={editableProfile.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <Input
                    name="address" // Add name attribute
                    value={editableProfile.address}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>Configure your trading settings and risk management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Tolerance</label>
                <div className="flex gap-2">
                  {["Conservative", "Moderate", "Aggressive"].map((risk) => (
                    <button
                      key={risk}
                      onClick={() => handleInputChange({ target: { name: "riskTolerance", value: risk } })}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${editableProfile.riskTolerance === risk
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                        }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Selected Account Type Details - Assuming this prop is still passed and used */}
              {selectedAccountTypeDetails ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Account Type</label>
                  <Card className="bg-gray-50 dark:bg-gray-800 shadow-none border-dashed border-gray-300 dark:border-gray-600">
                    <CardContent className="pt-4 space-y-2">
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedAccountTypeDetails.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAccountTypeDetails.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <span className="font-medium">Min. Investment:</span> ${selectedAccountTypeDetails.min_investment.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Management Fee:</span> {selectedAccountTypeDetails.management_fee}%
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Key Features:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                          {selectedAccountTypeDetails.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Supported Risk Levels:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedAccountTypeDetails.risk_levels.map((risk, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{risk}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No account type selected. Go to "Account Types" to choose one.</p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                <Badge variant="success">Verified</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Followed Investors Section */}
          {followedInvestors && followedInvestors.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Copied Investor</CardTitle>
                <CardDescription>Investor you are currently copying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {followedInvestors.slice(0, 1).map((investor) => ( // Only show the first one
                    <div key={investor.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={investor.avatar_url || "/placeholder.svg"}
                          alt={investor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{investor.name}</h4>
                            {investor.verified && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{investor.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRiskColor(investor.risk_level)}>
                              {investor.risk_level.charAt(0).toUpperCase() + investor.risk_level.slice(1)} Risk
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-medium">{investor.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">+{investor.monthly_return}%</div>
                        <div className="text-xs text-gray-500">This Month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Copied Investor</CardTitle>
                <CardDescription>Investor you copy will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>You're not copying any investors yet.</p>
                  <p className="text-sm mt-2">Go to Settings → Copy Trading to find investors to copy.</p>
                </div>
              </CardContent>
            </Card>
          )}

        </TabsContent>
      </Tabs>
    </div>
  )
}