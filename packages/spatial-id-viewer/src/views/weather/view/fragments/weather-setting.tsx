import { memo, useState } from 'react';

interface SettingProps {
  setType: React.Dispatch<React.SetStateAction<string>>;
}

export const WeatherSettings = memo((props: SettingProps) => {
  const setType = props.setType;
  const [selectedOption, setSelectedOption] = useState('windDirection');
  const options = [
    { label: 'Wind Direction', value: 'windDirection' },
    { label: 'Wind Speed', value: 'windSpeed' },
    { label: 'Cloud Rate', value: 'cloudRate' },
    { label: 'Temperature', value: 'temperature' },
    { label: 'Dew Point', value: 'dewPoint' },
    { label: 'Pressure', value: 'pressure' },
    { label: 'Precipitation', value: 'precipitation' },
    { label: 'Visibility', value: 'visibility' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedOption(value);
    setType(value);
  };

  return (
    <div>
      {options.map((option) => (
        <div key={option.value}>
          <label>
            <input
              type="radio"
              name="settingType"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={handleChange}
            />
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
});
