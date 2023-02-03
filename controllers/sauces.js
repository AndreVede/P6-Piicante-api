const Sauce = require('../models/Sauce');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(401).json({ error }));
};

exports.getSauceById = (req, res, next) => {};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
        }`,
    });

    sauce
        .save()
        .then(() => res.status(201).json({ message: 'Sauce ajoutée' }))
        .catch(error => res.status(400).json({ error }));
};

exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file
        ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body };
    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({
                    message: "L'utilisateur a fait une action non autorisée",
                });
            } else {
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: 'Sauce mise à jour' })
                    )
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {};

exports.evalSauce = (req, res, next) => {};
