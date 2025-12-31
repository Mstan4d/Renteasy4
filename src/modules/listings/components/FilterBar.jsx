// src/modules/listings/components/FilterBar.jsx
import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, onClearFilters, states, lgas }) => {
  const { user } = useAuth(); // Add this to check user role
  
  const propertyTypes = [
    'Self Contain',
    '1 Bedroom',
    '2 Bedroom',
    '3 Bedroom',
    'Duplex',
    'Flat',
    'Studio',
    'Commercial Space'
  ];

  return (
    <div className="filter-bar">
      <div className="filter-bar-inner">
        {/* Search Input */}
        <div className="filter-group search-group">
          <Search size={18} className="filter-icon" />
          <input
            type="text"
            placeholder="Search by title, address, or name..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="search-input"
          />
        </div>

        {/* State Filter */}
        <div className="filter-group">
          <select
            value={filters.state}
            onChange={(e) => onFilterChange('state', e.target.value)}
            className="filter-select"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* LGA Filter */}
        <div className="filter-group">
          <select
            value={filters.lga}
            onChange={(e) => onFilterChange('lga', e.target.value)}
            disabled={!filters.state}
            className="filter-select"
          >
            <option value="">All LGAs</option>
            {lgas.map(lga => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div className="filter-group">
          <select
            value={filters.propertyType}
            onChange={(e) => onFilterChange('propertyType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-group price-group">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="price-input"
            min="0"
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="price-input"
            min="0"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Listings</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Approval</option>
            {/* Show Rejected filter only for admin/manager */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <option value="rejected">Rejected</option>
            )}
          </select>
        </div>

        {/* User Role Filter */}
        <div className="filter-group">
          <select
            value={filters.userRole}
            onChange={(e) => onFilterChange('userRole', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Posters</option>
            <option value="tenant">Tenants</option>
            <option value="landlord">Landlords</option>
            <option value="estate-firm">Estate Firms</option>
          </select>
        </div>

        {/* Verified Only Checkbox */}
        <div className="filter-group verification-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)}
              className="checkbox-input"
            />
            <span>Show only verified listings</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={onClearFilters}
          className="clear-filters-btn"
          title="Clear all filters"
        >
          <X size={16} />
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterBar;