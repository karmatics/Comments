class UserManager {
  constructor() {
    this.reset();
  }

  _normalizeName(name) {
    if (!name) return '';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  _validateName(name) {
    return /^[a-zA-Z]{2,}/.test(name);
  }

  getOrCreateUser(displayName) {
    if (!displayName || !this._validateName(displayName)) {
      console.error('Invalid username:', displayName);
      return null;
    }

    if (typeof CommunityOracle !== 'undefined') {
      const existing = CommunityOracle.getAllProfiles().find(
        p => p.name.toLowerCase() === displayName.toLowerCase()
      );
      if (existing) {
        const userObj = {
          id: existing.id,
          displayName: existing.name,
          normalizedName: this._normalizeName(existing.name),
          suffix: existing.tag,
          reputation: existing.reputation,
          badges: existing.badges || []
        };
        this.addUser(userObj);
        return userObj;
      }

      const created = CommunityOracle.addOrUpdateProfile({ name: displayName });
      const userObj = {
        id: created.id,
        displayName: created.name,
        normalizedName: this._normalizeName(created.name),
        suffix: created.tag,
        reputation: created.reputation,
        badges: created.badges || []
      };
      this.addUser(userObj);
      return userObj;
    }

    const normalized = this._normalizeName(displayName);
    const existingUsers = this.usersByNormalizedName.get(normalized) || [];
    const existingUser = existingUsers.find(u => u.displayName === displayName);
    if (existingUser) return existingUser;

    const suffix = existingUsers.length + 1001;
    const id = `${normalized}${suffix}`;
    const newUser = {
      id,
      displayName,
      normalizedName: normalized,
      suffix,
      reputation: 0.50,
      badges: ['Contributor']
    };

    this.addUser(newUser);
    return newUser;
  }

  getUserById(id) {
    if (this.usersById.has(id)) {
      return this.usersById.get(id);
    }

    if (typeof CommunityOracle !== 'undefined') {
      const prof = CommunityOracle.getProfile(id);
      if (prof) {
        const user = {
          id: prof.id,
          displayName: prof.name,
          normalizedName: this._normalizeName(prof.name),
          suffix: prof.tag,
          reputation: prof.reputation,
          badges: prof.badges || []
        };
        this.addUser(user);
        return user;
      }
    }

    return {
      id: id || 'unknown',
      displayName: 'Anonymous',
      normalizedName: 'anonymous',
      suffix: 1099,
      reputation: 0.25,
      badges: ['Guest']
    };
  }

  getAllUsers() {
    if (typeof CommunityOracle !== 'undefined') {
      const profiles = CommunityOracle.getAllProfiles();
      profiles.forEach(p => {
        if (!this.usersById.has(p.id)) {
          this.addUser({
            id: p.id,
            displayName: p.name,
            normalizedName: this._normalizeName(p.name),
            suffix: p.tag,
            reputation: p.reputation,
            badges: p.badges || []
          });
        }
      });
    }
    return Array.from(this.usersById.values());
  }

  isDuplicate(normalizedName) {
    const users = this.usersByNormalizedName.get(normalizedName);
    return users && users.length > 1;
  }

  reset() {
    this.usersByNormalizedName = new Map();
    this.usersById = new Map();
  }

  loadUsers(usersArray) {
    this.reset();
    if (!usersArray) return;
    usersArray.forEach(user => this.addUser(user));
  }

  addUser(user) {
    if (!user || !user.id) return;

    const oldUser = this.usersById.get(user.id);
    if (oldUser) {
      const oldUserGroup = this.usersByNormalizedName.get(oldUser.normalizedName);
      if (oldUserGroup) {
        const index = oldUserGroup.findIndex(u => u.id === oldUser.id);
        if (index > -1) oldUserGroup.splice(index, 1);
      }
    }

    this.usersById.set(user.id, user);

    const normalized = user.normalizedName || this._normalizeName(user.displayName);
    const userGroup = this.usersByNormalizedName.get(normalized) || [];
    if (!userGroup.some(u => u.id === user.id)) {
      userGroup.push(user);
    }
    this.usersByNormalizedName.set(normalized, userGroup);
  }
}

globalThis.UserManager = UserManager;
if (typeof module !== 'undefined' && module.exports) module.exports = UserManager;