const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { secret } = require('../config/vars')

exports.newUser = async (req, res) => {
  //Revisar si hay errores
  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() })
  }

  //Extraer email y password
  const { email, password } = req.body

  try {
    //Revisar que el user sea unico
    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ msg: 'There is an user with those credentials' })
    }

    //Crea usuario
    user = new User(req.body)

    //Hash del password
    const salt = await bcryptjs.genSalt(10)
    user.password = await bcryptjs.hash(password, salt)

    //Guardar usuario
    await user.save()

    //Crear y firmar el JWT
    const payload = {
      user: {
        id: user.id,
      },
    }

    //Firmar el Token
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: 3600, // 1 Hora
      },
      (error, token) => {
        if (error) throw error
        res.json({ token })
      }
    )
  } catch (error) {
    console.log(error)
  }
}
