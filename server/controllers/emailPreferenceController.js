import EmailPreference from "../models/EmailPreference.js";

export const unsubscribeEmail = async (req, res) => {
  const pref = await EmailPreference.findOne({ unsubscribeToken: req.params.token });
  if (!pref) return res.status(404).send("Invalid link");

  pref.unsubscribedAll = true;
  await pref.save();

  res.send("You have unsubscribed successfully.");
};

export const updateEmailPreferences = async (req, res) => {
  const { email, preferences } = req.body;

  const pref = await EmailPreference.findOneAndUpdate({ email }, { ...preferences }, { upsert: true, new: true });

  res.json({ success: true, pref });
};
