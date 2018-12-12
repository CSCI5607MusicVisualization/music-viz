function minA(array)
{
  min = Infinity;

  for (i = 0; i < array.length; i++)
  {
    if (array[i] == Infinity)
    {

    }
    else
    {
      if (array[i] < min)
      {
        min = array[i];
      }
    }

  }

  return min;

}

function maxA(array)
{
  max = -Infinity;

  for (i = 0; i < array.length; i++)
  {
    if (array[i] == -Infinity)
    {

    }
    else
    {
      if (array[i] > max)
      {
        max = array[i];
      }
    }

  }

  return max;

}

function normalize(value, min, max)
{
  return (value - min) / (max - min);
}

function pickColor(v)
{
  var a, b, c;
  // console.log("v: ", v);
  if (v > 38. && v < 39.) {
  a = 0.;
  b = 1.;
  c = 0.;
  }

  else if (v > 40) {
    a = 1.;
    b = 0.;
    c = 0.;

  } else {
    a = 0.;
    b = 0.;
    c = 1.;
  }

  // console.log(a, b, c);

  return [a, b, c];
}

function sleep(numberMillis) 
{
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
  while (true) 
  {
		now = new Date();
		if (now.getTime() > exitTime)
		return;
	}
}
