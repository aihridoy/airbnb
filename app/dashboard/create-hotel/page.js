"use client";

import React, { useEffect, useState } from "react";
import { addHotel, getHotelById, session, updateHotelById } from "../../action";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Pencil,
  Users,
  DoorOpen,
  BedDouble,
  Sparkles,
  Bell,
  Umbrella,
  Waves,
  Wifi,
  Utensils,
  Car,
  Dumbbell,
} from "lucide-react";

const AMENITY_ICONS = {
  "Beach access": Umbrella,
  "Private pool": Waves,
  "Free Wi-Fi": Wifi,
  Kitchen: Utensils,
  "Free Parking": Car,
  "Fitness Center": Dumbbell,
};

const HotelForm = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [hostName, setHostName] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState({
    propertyName: false,
    propertyLocation: false,
    propertyPrice: false,
    availableRoom: false,
    guestCapacity: false,
    bedroomCapacity: false,
    bedCapacity: false,
    description: false,
    serviceFee: false,
    cleaningFee: false,
  });
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    rent: "",
    hostName: "",
    guestCapacity: "",
    bedroomCapacity: "",
    bedCapacity: "",
    description: "",
    amenities: [],
    images: [],
    serviceFee: "",
    cleaningFee: "",
    category: "urban",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setHotelId(params.get("hotelId"));
    }
  }, []);

  useEffect(() => {
    if (hotelId) {
      const fetchHotel = async () => {
        try {
          const hotelData = await getHotelById(hotelId);
          setHotel(hotelData);
        } catch (error) {
          console.error("Error fetching hotel:", error);
        }
      };
      fetchHotel();
    }
  }, [hotelId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await session();
        if (!userData) {
          router.push("/login");
          return;
        }
        setUserId(userData?.user?.id || null);
        setHostName(userData?.user?.name || null);
      } catch (error) {
        console.error("Failed to fetch user session:", error);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userId && hostName) {
      setFormData((prev) => ({ ...prev, ownerId: userId, hostName: hostName }));
    }
  }, [userId, hostName]);

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      rent: "",
      hostName: "",
      guestCapacity: "",
      bedroomCapacity: "",
      bedCapacity: "",
      description: "",
      amenities: [],
      images: [],
      serviceFee: "",
      cleaningFee: "",
      ownerId: userId,
      hostName: hostName,
      category: "urban",
    });
  };

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        amenities: checked
          ? [...(prev.amenities || []), value]
          : (prev.amenities || []).filter((item) => item !== value),
      }));
    } else if (name.startsWith("image")) {
      const index = parseInt(name.replace("image", ""), 10);
      setFormData((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[index] = value;
        return { ...prev, images: updatedImages };
      });
      debounceValidateUrl(index, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const debounceValidateUrl = debounce((index, value) => {
    setIsValidUrl(false);
    const urlPattern = /^(http|https):\/\//;
    if (!urlPattern.test(value)) {
      setIsValidUrl(true);
    }
  }, 500);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidUrl) {
      toast.error("Please Provide Valid URL!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === "amenities") {
          form.append(key, JSON.stringify(value));
        } else if (key === "images") {
          if (hotelId) {
            form.append(key, JSON.stringify(value));
          } else {
            value.forEach((image) => {
              form.append("images[]", image);
            });
          }
        } else {
          form.append(key, value);
        }
      }
      if (hotelId) {
        await updateHotelById(hotelId, Object.fromEntries(form.entries()));
      } else {
        await addHotel(form);
      }
      resetForm();
      toast.success(
        hotelId ? "Hotel Updated Successfully!" : "Hotel Added Successfully!",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error("Failed to add hotel. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleInputVisibility = (field) => {
    setIsInputVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative bg-cream">
          <button
            type="submit"
            className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg absolute top-4 right-4 sm:right-6 text-sm sm:text-base transition-colors ${
              loading
                ? "bg-hairline text-muted cursor-not-allowed"
                : "bg-brass-dark text-cream hover:bg-brass"
            }`}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1 sm:mr-2" />
            )}
            {loading ? "Saving..." : hotelId ? "Update" : "Publish"}
          </button>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isInputVisible.propertyName ? (
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Property Name"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl text-muted mb-2">
                  {(hotelId && !formData.title && hotel?.title) ||
                    formData.title ||
                    "Property Name"}
                </h1>
              )}
              {isInputVisible.propertyName ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyName")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyName")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-muted mt-2">
              {isInputVisible.propertyLocation ? (
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Property Location"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <span className="text-sm sm:text-base">
                  {(hotelId && !formData.location && hotel?.location) ||
                    formData.location ||
                    "Property Location"}
                </span>
              )}
              {isInputVisible.propertyLocation ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyLocation")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyLocation")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={
                  index === 0
                    ? "col-span-1 sm:col-span-2 row-span-2"
                    : "col-span-1"
                }
              >
                <div className="relative w-full h-auto aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden rounded-lg bg-surface-alt">
                  <Image
                    fill
                    src={
                      (hotelId &&
                        !formData.images[index] &&
                        hotel?.images[index]) ||
                      formData.images[index] ||
                      "https://placehold.co/600x400"
                    }
                    alt={`Room ${index}`}
                    className="object-cover rounded-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={index === 0}
                    unoptimized={true}
                  />
                  <input
                    type="text"
                    name={`image${index}`}
                    placeholder="https://placehold.co/600x400"
                    value={formData.images[index] || ""}
                    onChange={handleChange}
                    className="w-11/12 p-1.5 sm:p-2 border border-brass rounded-lg absolute left-1/2 -translate-x-1/2 bottom-2 bg-surface text-xs sm:text-sm z-10"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full sm:w-auto my-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-ink mb-1"
            >
              Property Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full sm:w-72 px-4 py-2 border border-hairline rounded-lg shadow-sm bg-surface text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass transition duration-150"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="urban">Urban</option>
              <option value="beach">Beach</option>
              <option value="mountain">Mountain</option>
              <option value="luxury">Luxury</option>
              <option value="rustic">Rustic</option>
              <option value="countryside">Countryside</option>
              <option value="lakeside">Lakeside</option>
              <option value="desert">Desert</option>
              <option value="island">Island</option>
              <option value="ski">Ski</option>
            </select>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isInputVisible.propertyPrice ? (
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  placeholder="Property Rent"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <span className="text-lg sm:text-xl font-serif text-ink">
                  {hotelId
                    ? formData.rent
                      ? `$${formData.rent}`
                      : `$${hotel?.rent || "Price in USD"}`
                    : formData.rent
                    ? `$${formData.rent}`
                    : "Price in USD"}
                </span>
              )}
              {isInputVisible.propertyPrice ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyPrice")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyPrice")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
              <span className="text-muted text-sm sm:text-base">per night</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="border-b border-hairline pb-4 sm:pb-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 gap-4 text-muted">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {isInputVisible.guestCapacity ? (
                        <input
                          type="number"
                          id="guestCapacity"
                          name="guestCapacity"
                          value={formData.guestCapacity}
                          onChange={handleChange}
                          placeholder="Guest Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.guestCapacity &&
                            hotel?.guestCapacity) ||
                            formData.guestCapacity ||
                            "How many Guests can Stay?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.guestCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("guestCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("guestCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      {isInputVisible.bedroomCapacity ? (
                        <input
                          type="number"
                          id="bedroomCapacity"
                          name="bedroomCapacity"
                          value={formData.bedroomCapacity}
                          onChange={handleChange}
                          placeholder="Bedroom Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.bedroomCapacity &&
                            hotel?.bedroomCapacity) ||
                            formData.bedroomCapacity ||
                            "How many Bedrooms?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.bedroomCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("bedroomCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("bedroomCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4" />
                      {isInputVisible.bedCapacity ? (
                        <input
                          type="number"
                          id="bedCapacity"
                          name="bedCapacity"
                          value={formData.bedCapacity}
                          onChange={handleChange}
                          placeholder="Bed Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.bedCapacity &&
                            hotel?.bedCapacity) ||
                            formData.bedCapacity ||
                            "How many beds available?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.bedCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("bedCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("bedCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isInputVisible.serviceFee ? (
                        <input
                          type="number"
                          id="serviceFee"
                          name="serviceFee"
                          value={formData.serviceFee}
                          onChange={handleChange}
                          placeholder="Service Fee"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {hotelId &&
                          (!formData.serviceFee
                            ? hotel?.serviceFee
                            : formData.serviceFee)
                            ? `$${formData.serviceFee || hotel?.serviceFee}`
                            : "Service Fee"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.serviceFee ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("serviceFee")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("serviceFee")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {isInputVisible.cleaningFee ? (
                        <input
                          type="number"
                          id="cleaningFee"
                          name="cleaningFee"
                          value={formData.cleaningFee}
                          onChange={handleChange}
                          placeholder="Cleaning Fee"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {hotelId &&
                          (!formData.cleaningFee
                            ? hotel?.cleaningFee
                            : formData.cleaningFee)
                            ? `$${formData.cleaningFee || hotel?.cleaningFee}`
                            : "Cleaning Fee"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.cleaningFee ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("cleaningFee")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("cleaningFee")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                  About this place
                </h3>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  {isInputVisible.description ? (
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write a short description about this place"
                      className="w-full mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                      rows="6"
                    />
                  ) : (
                    <p className="text-ink/80 leading-relaxed text-sm sm:text-base">
                      {(hotelId &&
                        !formData.description &&
                        hotel?.description) ||
                        formData.description ||
                        "Write a short description about this place"}
                    </p>
                  )}
                  {isInputVisible.description ? (
                    <button
                      type="button"
                      onClick={() => toggleInputVisibility("description")}
                      className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <Pencil
                      onClick={() => toggleInputVisibility("description")}
                      className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all shrink-0"
                    />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                  What this place offers
                </h3>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  id="amenities"
                >
                  {[
                    "Beach access",
                    "Private pool",
                    "Free Wi-Fi",
                    "Kitchen",
                    "Free Parking",
                    "Fitness Center",
                  ].map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity];
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          id={amenity}
                          name="amenities"
                          value={amenity}
                          checked={
                            (hotelId &&
                              hotel?.amenities &&
                              hotel.amenities.includes(amenity)) ||
                            formData.amenities.includes(amenity)
                          }
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <Icon className="w-4 h-4 text-brass-dark" />
                        <label htmlFor={amenity} className="text-sm sm:text-base text-ink">
                          {amenity}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default HotelForm;
