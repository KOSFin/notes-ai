import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Country } from '../../types';
import { countries } from '../../lib/countries';
import Icon from '../Icon';

interface CountrySelectProps {
    selectedCountry: string | undefined;
    onSelectCountry: (countryCode: string) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ selectedCountry, onSelectCountry }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selected = useMemo(() => countries.find(c => c.code === selectedCountry), [selectedCountry]);

    const filteredCountries = useMemo(() => {
        return countries.filter(country =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (countryCode: string) => {
        onSelectCountry(countryCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                className="w-full bg-primary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center">
                    {selected ? (
                        <>
                            <span className="mr-2">{selected.flag}</span>
                            <span>{selected.name}</span>
                        </>
                    ) : (
                        <span>Select a country</span>
                    )}
                </span>
                <Icon name="chevron" className={`h-5 w-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-secondary shadow-lg rounded-md border border-border-color max-h-80 flex flex-col">
                    <div className="p-2 border-b border-border-color">
                        <input
                            type="text"
                            placeholder="Search country..."
                            className="w-full bg-primary border border-border-color rounded-md py-1.5 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <ul className="overflow-y-auto scrollbar-hide flex-1">
                        {filteredCountries.map(country => (
                            <li key={country.code}>
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-white flex items-center"
                                    onClick={() => handleSelect(country.code)}
                                >
                                    <span className="mr-3">{country.flag}</span>
                                    <span>{country.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CountrySelect;