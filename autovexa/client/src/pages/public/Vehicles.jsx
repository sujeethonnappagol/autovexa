import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchVehicles, setFilters, clearFilters, setSortBy, selectFilteredVehicles } from '../../redux/vehicleSlice';
import VehicleCard from '../../components/VehicleCard';
import Loading from '../../components/Loading';
import { BRANDS, VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS, SORT_OPTIONS } from '../../utils/constants';
import { HiOutlineAdjustments } from 'react-icons/hi';

export default function Vehicles() {
  const dispatch = useDispatch();
  const vehicles = useSelector(selectFilteredVehicles);
  const { loading, filters, sortBy } = useSelector((s) => s.vehicles);
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchVehicles());
    const brand = searchParams.get('brand');
    if (brand) dispatch(setFilters({ brand }));
  }, [dispatch, searchParams]);

  const handleFilter = (key, value) => dispatch(setFilters({ [key]: value }));

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10">
        <div>
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-1.5">Inventory</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">All Vehicles</h1>
          <p className="text-slate-500 mt-2">{vehicles.length} vehicles found</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
            className="input-field w-full sm:w-auto min-w-[180px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline md:hidden flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <HiOutlineAdjustments /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Filters sidebar */}
        <aside className={`lg:w-72 xl:w-80 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card-static p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
              <button
                onClick={() => dispatch(clearFilters())}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="label">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilter('search', e.target.value)}
                  placeholder="Brand or Model"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Brand</label>
                <select value={filters.brand} onChange={(e) => handleFilter('brand', e.target.value)} className="input-field">
                  <option value="">All Brands</option>
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Vehicle Type</label>
                <select value={filters.type} onChange={(e) => handleFilter('type', e.target.value)} className="input-field">
                  <option value="">All Types</option>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fuel Type</label>
                <select value={filters.fuelType} onChange={(e) => handleFilter('fuelType', e.target.value)} className="input-field">
                  <option value="">All</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Transmission</label>
                <select value={filters.transmission} onChange={(e) => handleFilter('transmission', e.target.value)} className="input-field">
                  <option value="">All</option>
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Price</label>
                  <input type="number" value={filters.minPrice} onChange={(e) => handleFilter('minPrice', e.target.value)} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="label">Max Price</label>
                  <input type="number" value={filters.maxPrice} onChange={(e) => handleFilter('maxPrice', e.target.value)} placeholder="Any" className="input-field" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Loading message="Loading vehicles..." />
          ) : vehicles.length === 0 ? (
            <div className="text-center py-24 px-6 card-static">
              <p className="text-xl font-semibold text-slate-700">No vehicles found</p>
              <p className="text-slate-500 mt-2 mb-6">Try changing your filters or search terms.</p>
              <button onClick={() => dispatch(clearFilters())} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
