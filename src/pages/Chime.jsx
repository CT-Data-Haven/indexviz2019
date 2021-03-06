import React, { useState } from 'react';

import { Row, Col } from 'react-bootstrap';
import useForm, { FormContext } from 'react-hook-form';
import { schemeBuPu as palette } from 'd3-scale-chromatic';

import Stage from '../components/Stage';
import { ControlHolder, ChimeMainControls } from '../components/Controls';
import Choropleth from '../components/Choropleth';
import Profile from '../components/Profile';

import { getQMeta, getMapData, makeChoroScale, getGrpProfile } from '../utils/utils.js';

const Chime = ({ data, meta, shape, intro }) => {
  const formMethods = useForm({
    mode: 'onChange'
  });
  const ages = Object.keys(meta);
  const initValues = {
    indicator: meta[ages[0]][0].indicator,
    age: ages[0]
  };

  const towns = Object.keys(getMapData(data[initValues.age], initValues.indicator));
  const [age, setAge] = useState(initValues.age);
  const [indicator, setIndicator] = useState(initValues.indicator);
  const [town, setTown] = useState(towns[0]);
  // const [view, setView] = useState(initValues.view);

  const onChange = (data, e) => {
    const { _age, _indicator } = formMethods.getValues();
    setIndicator(_indicator);
    setAge(_age);
  };

  const onFeatureClick = ({ layer }) => {
    setTown(layer.feature.properties.name);
  };

  const mapData = getMapData(data[age], indicator);
  const profileData = getGrpProfile(data, 'name', town, meta, indicator, null);
  const qDisplay = getQMeta(meta[age], indicator) || '';

  return (
    <div className='Chime'>
      <Row>
        <Col md={ 6 }>
          <FormContext { ...formMethods }>
            <ControlHolder>
              <ChimeMainControls
                onChange={ formMethods.handleSubmit(onChange) }
                ages={ ages }
                indicators={ meta[age] }
              />
            </ControlHolder>
          </FormContext>
        </Col>
      </Row>

      <Row>
        <Col md={ 6 }>
          <Stage
            type='lblBy2'
            lbl={ qDisplay.display + ' hospital encounters' }
            dataBy={ 'town' }
            grouping={ age.toLowerCase() }
            axisLbl={ 'Rate per 10,000 residents' }
            flush
          >
            <Choropleth
              data={ mapData }
              shape={ shape }
              colorscale={ makeChoroScale(mapData, palette, 5) }
              meta={ { format: ',d' } }
              onClick={ onFeatureClick }
            />
          </Stage>
        </Col>
        <Col md={ 6 } className='second'>
          <Stage
            type='lblBy2'
            lbl={ qDisplay.display + ' encounters' }
            dataBy={ 'age' }
            grouping={ town }
            axisLbl={ 'Rate per 10,000 residents' }
            flush
          >
            <Profile
              data={ profileData }
              meta={ meta[age] }
              cols={ ['Condition', 'Rate'] }
            />
          </Stage>
        </Col>
      </Row>
    </div>
  )
};

export default Chime;
