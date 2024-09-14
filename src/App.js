import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { TextInput, Button, Table } from '@mantine/core';
import { useStore } from './store';
import './index.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,setLastName] = useState('');
  const [designation,setDesignation] = useState('');
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: '', description: '' });
  const [editAsset, setEditAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); // State for selected asset
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', designation: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [registering, setRegistering] = useState(false);

  const user = useStore((state) => state.user);
  const role = useStore((state) => state.role);
  const setUser = useStore((state) => state.setUser);
  const logout = useStore((state) => state.logout);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchAssets();
    if (user) fetchProfile();
  }, [user]);

  const fetchAssets = async (searchTerm = '') => {
    let query = supabase.from('assets').select('*');

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) {
      setError('Error fetching assets');
      console.error('Error fetching assets:', error);
    } else {
      setAssets(data);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, designation')
      .eq('id', user.id)
      .single();

    if (error) {
      setError('Error fetching profile');
      console.error('Error fetching profile:', error);
    } else {
      setProfile({
        firstName: data.first_name,
        lastName: data.last_name,
        designation: data.designation,
      });
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if(role === 'admin')
    {
      setError('Admins cannot update profiles.');
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.firstName,
        last_name: profile.lastName,
        designation: profile.designation,
      })
      .eq('id', user.id);

    if (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    } else {
      setIsEditingProfile(false);
      //setSuccess('Profile updated successfully');
      alert('Profile updated successfully');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      //setError('Error logging in');
      alert('Error logging in');
      setLoading(false);
      return;
    }

    const { user } = data;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError || !profile) {
      setError('No profile found or error fetching profile');
      setLoading(false);
      return;
    }

    setUser(user, profile.role);
    fetchAssets(searchTerm);
    fetchProfile();
    //setSuccess('Login successful');
    console.log('login success');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    //setSuccess('Logout successful');
    setError(null);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      setFirstName,
      setLastName,
      designation,
    });

    if (signUpError) {
      setError('Error registering user');
      setLoading(false);
      return;
    }

    const { user } = data;
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: user.id, role: 'management' }]);

    if (profileError) {
      setError('Error creating profile');
      setLoading(false);
      return;
    }

    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setDesignation('');
    setRegistering(false);
    setSuccess('Registration successful');
    setLoading(false);
  };

  const handleCreateAsset = async () => {
    if (role !== 'admin') {
      setError('You do not have permission to create assets.');
      return;
    }

    setError(null);
    setSuccess(null);

    const { data, error } = await supabase
      .from('assets')
      .insert([{ name: newAsset.name, description: newAsset.description, created_by: user.id }])
      .select();

    if (error) {
      setError('Error creating asset');
      console.error('Error creating asset:', error);
      return;
    }

    if (data && data.length > 0) {
      setAssets([...assets, ...data]);
      setNewAsset({ name: '', description: '' });
      setSuccess('Asset created successfully');
    } else {
      setError('No data returned from the database');
    }
  };

  const handleEditAsset = (asset) => {
    if (role !== 'admin') {
      setError('You do not have permission to edit assets.');
      return;
    }
    setEditAsset({ ...asset });
  };

  const handleSaveEdit = async () => {
    if (role !== 'admin') {
      setError('You do not have permission to edit assets.');
      return;
    }

    if (!editAsset || !editAsset.id) {
      setError('No asset selected for editing.');
      return;
    }

    const { error } = await supabase
      .from('assets')
      .update({ name: editAsset.name, description: editAsset.description })
      .eq('id', editAsset.id);

    if (error) {
      setError('Error updating asset');
      return;
    }

    setAssets(assets.map((a) => (a.id === editAsset.id ? { ...a, ...editAsset } : a)));
    setEditAsset(null);
    setSuccess('Asset updated successfully');
  };

  const handleDeleteAsset = async (id) => {
    if (role !== 'admin') {
      setError('You do not have permission to delete assets.');
      return;
    }

    const { error } = await supabase.from('assets').delete().eq('id', id);

    if (error) {
      setError('Error deleting asset');
      return;
    }
    setAssets(assets.filter((asset) => asset.id !== id));
    setSuccess('Asset deleted successfully');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    fetchAssets(searchTerm);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAssets = assets;

  const sortedAssets = filteredAssets.sort((a, b) => {
    if (sortColumn) {
      if (sortDirection === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    } else {
      return 0;
    }
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredAssets.length / rowsPerPage);
  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(1, page - 2);
    return start + i;
  });

  return (
    <div className="App">
      {!user ? (
        <div >
          {registering ? (
            <div className="register">
            <div className="input-group">
              <h2>Registration</h2>
              <TextInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <TextInput
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <TextInput
                  label="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
              <Button onClick={handleRegister} loading={loading}>
                Register
              </Button>
              <Button onClick={() => setRegistering(false)}>Cancel</Button>
            </div>
            </div>
          ) : (
            <div className="box">
              <h2>Welcome Back!</h2>
              <div className="input-group">
              <TextInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              </div>
              <Button onClick={handleLogin} loading={loading}>
                Login
              </Button>
              <Button onClick={() => setRegistering(true)}>Register</Button>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>
      ) : (
        <div>
          <div className="logout-button">
          <Button className="logout" onClick={handleLogout} loading={loading}>
            Logout
          </Button>
          </div>

          {role === 'admin' && (
            <div>
              <TextInput
                label="Asset Name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              />
              <TextInput
                label="Description"
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
              />
              <Button onClick={handleCreateAsset} loading={loading}>
                Create Asset
              </Button>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
            </div>
          )}

          {role === 'admin' && editAsset && (
            <div>
              <TextInput
                label="Asset Name"
                value={editAsset.name}
                onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
              />
              <TextInput
                label="Description"
                value={editAsset.description}
                onChange={(e) => setEditAsset({ ...editAsset, description: e.target.value })}
              />
              <Button onClick={handleSaveEdit} loading={loading}>
                Save Edits
              </Button>
            </div>
          )}

          {(
            <div className="search-container">
              <TextInput
                placeholder="Search assets"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="search-button" onClick={handleSearch}>Search Assets</Button>
            </div>
          )}

          <Table>
            <thead>
              <tr style={{ backgroundColor: role === 'admin' ? 'blue' : 'transparent' }}>
                <th onClick={() => handleSort('name')}>Name</th>
                <th onClick={() => handleSort('description')}>Description</th>
                {role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} onClick={() => setSelectedAsset(asset)}>
                  <td>{asset.name}</td>
                  <td>{asset.description}</td>
                  {role === 'admin' && (
                    <td>
                      <Button onClick={() => handleEditAsset(asset)}>Edit</Button>
                      <Button onClick={() => handleDeleteAsset(asset.id)}>Delete</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {selectedAsset && (
            <div className="asset-details">
              <h2>Asset Details</h2>
              <p><strong>Name:</strong> {selectedAsset.name}</p>
              <p><strong>Description:</strong> {selectedAsset.description}</p>
            </div>
          )}

          <div className="pagination">
            <Button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {'<'}
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                active={pageNumber === page}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {'>'}
            </Button>
          </div>

          { role=== 'management' && (isEditingProfile ? (
            <div>
              <TextInput
                label="First Name"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
              />
              <TextInput
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
              />
              <TextInput
                label="Designation"
                name="designation"
                value={profile.designation}
                onChange={handleProfileChange}
              />
              <Button onClick={handleSaveProfile} loading={loading}>
                Save Profile
              </Button>
              <Button onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            </div>
          ) : (
            <div>
              <h3>Profile</h3>
              <p><strong>First Name:</strong> {profile.firstName}</p>
              <p><strong>Last Name:</strong> {profile.lastName}</p>
              <p><strong>Designation:</strong> {profile.designation}</p>
              <Button onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
            </div>
          )
          
          )}
        </div>
      )}
    </div>
  );
}

export default App;
