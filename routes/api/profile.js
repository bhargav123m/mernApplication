const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const request = require('request');
const config = require('config');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Posts');
const { check, validationResult } = require('express-validator');

//@route Get api/profile/me
//@route Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res
        .status(400)
        .json({ mssg: 'there is no profile for this user' });
    }
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Psot api/profile
//@route Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (location) profileFeilds.location = location;
    if (bio) profileFeilds.bio = bio;
    if (status) profileFeilds.status = status;
    if (githubusername) profileFeilds.githubusername = githubusername;
    if (skills) {
      profileFeilds.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (linkedin) profileFeilds.social.linkedin = linkedin;
    if (instagram) profileFeilds.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (e) {
      res.status(500).send('server error');
    }
  }
);

//@route Get api/profile
//@access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

//@route Get api/profile/user/:id
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (e) {
    if ((e.kind = 'ObjectId')) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.status(500).send('Server error');
  }
});

//@route Delete api/profile/
//@access private
router.delete('/', auth, async (req, res) => {
  try {
    await Post.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.send({ msg: 'User Removed' });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

//@route Post api/profile/experience
//@access private
router.post(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required')
        .not()
        .isEmpty(),
      check('company', 'company is required')
        .not()
        .isEmpty(),
      check('from', 'from data is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      res.status(500).send('Server Error');
    }
  }
);

//@route Update api/profile/experience/update/:id
//@access private
router.patch('/experience/update/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const updateIndex = profile.experience.filter(matchId => {
      return matchId.id == req.params.id;
    });

    if (!updateIndex.length > 0) {
      return res.status(400).send('cannot update');
    }
    for (let key in req.body) {
      updateIndex[0][key] = req.body[key];
    }
    await profile.save();
    res.status(200).send({ msg: 'updated!!!' });
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Delete api/profile/experience/delete/:id
//@access private
router.delete('/experience/delete/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.forEach((experience, index) => {
      if (experience.id === req.params.id) {
        profile.experience.splice(index, 1);
      }
    });
    await profile.save();
    res.status(200).send(profile);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

//@route Post api/profile/education
//@access private
router.post(
  '/education',
  [
    auth,
    [
      check('school', 'school is required')
        .not()
        .isEmpty(),
      check('degree', 'degree is required')
        .not()
        .isEmpty(),
      check('from', 'from data is required')
        .not()
        .isEmpty(),
      check('feildofstudy', 'feildofstudy data is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'profile not found' });
      }
      profile.education.unshift(req.body);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      res.status(500).send('server error');
    }
  }
);

//@route update api/profile/education/update/:id
//@access private
router.patch('/education/update/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: 'profile not found' });
    }
    const updateIndex = profile.education.filter(education => {
      return education.id == req.params.id;
    });

    if (!updateIndex.length > 0) {
      return res.status(400).send('cannot update because the id didnot match');
    }
    for (let key in req.body) {
      updateIndex[0][key] = req.body[key];
    }
    await profile.save();
    res.status(200).json({ msg: 'education updated' });
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Delete api/profile/education/delete/:id
//@access private
router.delete('/education/delete/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.forEach((education, index) => {
      if (education.id === req.params.id) {
        profile.education.splice(index, 1);
      }
    });
    await profile.save();
    res.status(200).send(profile);
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Get api/profile/github/:username
//@access public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      url:
        'https://api.github.com/users/' +
        req.params.username +
        '/repos?per_page=5@sort=created:asc&client_id=' +
        config.get('githubClientId') +
        '&client_secret=' +
        config.get('githubSecret'),
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options, (error, response, body) => {
      if (error) {
        console.log(error);
      }

      if (response.statusCode !== 200) {
        return res.status(400).json({ msg: 'No Github Profile Found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (e) {
    res.status(500).send('server error');
  }
});

module.exports = router;
